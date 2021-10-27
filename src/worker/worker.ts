import Queue from "bee-queue";
import type { Job } from "bee-queue";
import * as redisClient from "redis";
import got from "got";
import debug from "debug";
import { queueName } from "../lib/constants";
import type { TimerRecord } from "../lib/timer";

const log = debug("timers:worker");

async function process(job: Job<TimerRecord>, done: Queue.DoneCallback<void>): Promise<void> {
    const timer = job.data;
    log(`Processing job ${job.id} with timer %o`, timer);
    // TODO: fail the job if response code isn't 200
    await got(timer.url + '/' + timer.id).then(() => done(null), done);
}

export function startWorker(redisUrl: string) {
    const redis = redisClient.createClient(redisUrl);
    const queue = new Queue<TimerRecord>(queueName, { isWorker: true, redis });

    queue.process(process);
}
