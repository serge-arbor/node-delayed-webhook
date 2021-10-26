import express from "express";
import type { RequestHandler } from "express";
import { promisify } from "util";
import { TimerRecord, timerSpecToMs, verifyTimerPayload, verifyTimerRecord } from "../lib/timer";
import Queue from "bee-queue";
import * as redisClient from "redis";
import { queueName } from "../lib/constants";

const timersCounter = "timersCounter";

function tryParseJson(json: string): any {
    try {
        return JSON.parse(json);
    } catch (error) {
        return null;
    }
}

export function routes(redisUrl: string): RequestHandler {
    const redis = redisClient.createClient(redisUrl);
    const queue = new Queue(queueName, { isWorker: false, activateDelayedJobs: true, redis });
    const routes = express();
    const incrKey = promisify(redis.incr.bind(redis));
    const setKey = promisify(redis.set.bind(redis));
    const getKey = promisify(redis.get.bind(redis));

    routes.get("/ping", function (req, res) {
        res.json({ response: "pong" });
    });

    routes.get("/timers/:id", async function (req, res) {
        const id = req.params.id;
        const json = await getKey(`timer:${id}`);
        const timer = tryParseJson(json);
        if (!verifyTimerRecord(timer)) {
            res.status(404).json({ error: "timer not found or broken" });
            return;
        }
        const timeLeft = parseInt(timer.deadline, 10) - Date.now();
        res.json({ id: timer.id, time_left: timeLeft > 0 ? Math.ceil(timeLeft / 1000) : 0 });
    });

    routes.post("/timers", async function (req, res) {
        const timerPayload = req.body;
        if (!verifyTimerPayload(timerPayload)) {
            res.status(400).json({ error: "invalid timer spec" });
            return;
        }

        // It's a bottleneck of this design.
        // Because there is a point of synchronization between all the http-api workers.
        // If it's acceptable to replace continuous IDs with UUIDs or other randomized IDs,
        // it'll allow to scale number of http-api instances drastically.
        const id = await incrKey(timersCounter);
        const deadline = Date.now() + timerSpecToMs(timerPayload);
        const timer: TimerRecord = { id, deadline: deadline.toString(), url: timerPayload.url };

        await setKey(`timer:${id}`, JSON.stringify(timer));
        const job = queue.createJob(timer);
        job.delayUntil(deadline);
        await job.save();

        res.status(201).json({ id });
    });

    return routes;
}
