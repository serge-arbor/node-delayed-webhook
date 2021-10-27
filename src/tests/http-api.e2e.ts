import * as crypto from "crypto";
import got from "got";
import pWaitFor from "p-wait-for";
import type { TimerPayload } from "../lib/timer";
import { promisify } from "util";
import * as http from "http";

const defaultTestServerHost = "localhost";
const testServerHost = process.env.TIMERS_TEST_SERVER_HOST ?? defaultTestServerHost;
const defaultTestServerPort = 18080;
const envPort = parseInt(process.env.TIMERS_TEST_SERVER_PORT, 10);
const testServerPort = isNaN(envPort) ? defaultTestServerPort : envPort;

const defaultHttpApiEndpoint = "http://localhost:3000";
const httpApiEndpoint = process.env.TIMERS_API_ENDPOINT ?? defaultHttpApiEndpoint;

async function checkHttpApiResponse(endpoint: string): Promise<boolean> {
    let response = null;
    try {
        response = await got(endpoint + "/ping");
    } catch (_) {}
    return response?.statusCode === 200;
}

function makeTestUrl(testId: string): string {
    return `http://${testServerHost}:${testServerPort}/test/${testId}`;
}

function makeApiUrl(timerId?: string): string {
    return httpApiEndpoint + "/timers/" + (timerId ?? "");
}

describe("Timers Service", function () {
    let testServer: null | http.Server = null;
    let requestsReceived: Array<string> = [];

    beforeAll(async function () {
        await pWaitFor(async (): Promise<boolean> => checkHttpApiResponse(httpApiEndpoint), {
            interval: 100,
            timeout: 30 * 1000,
        });

        testServer = http.createServer(function (req, res) {
            const match = /\/test\/([\d\w\-]*)\/(\d+)/.exec(req.url);
            if (match.length < 2) {
                res.statusCode = 404;
            } else {
                requestsReceived.push(match[1]);
            }
            res.end();
        });
        const listen = promisify(testServer.listen.bind(testServer));
        await listen(testServerPort, testServerHost);
        testServer.unref();
    });

    beforeEach(async function () {
        requestsReceived = [];
    });

    describe("POST /timers", () => {
        it("should return the status code 201 if a correct timer specification is passed", async () => {
            const testId = crypto.randomUUID();
            const url = makeTestUrl(testId);
            const timer: TimerPayload = { url, seconds: 1 };
            const res = await got.post(makeApiUrl(), { json: timer });
            expect(res.statusCode).toEqual(201);
            await pWaitFor(() => requestsReceived.length > 0, { interval: 10, timeout: 30 * 1000 });
            expect(requestsReceived).toContain(testId);
        });

        it("should return the status code 400 if an incorrect timer specification is passed", async () => {
            const timer = { seconds: 1 };
            const res = await got.post(makeApiUrl(), { json: timer, throwHttpErrors: false });
            expect(res.statusCode).toEqual(400);
        });
    });

    describe("GET /timers/:id", () => {
        it("should return time left to the deadline", async () => {
            const testId = crypto.randomUUID();
            const url = makeTestUrl(testId);
            const timerTimeoutSec = 600;
            const timer: TimerPayload = { url, seconds: timerTimeoutSec };

            const createResponse = await got.post<{ id: number }>(makeApiUrl(), { json: timer, responseType: "json" });
            expect(createResponse.statusCode).toEqual(201);
            const timerId = createResponse.body.id;

            const getResponse = await got.get<{ id: number; time_left: number }>(makeApiUrl(timerId.toString()), {
                responseType: "json",
            });
            expect(getResponse.statusCode).toEqual(200);
            expect(getResponse.body.id).toEqual(timerId);
            expect(getResponse.body.time_left).toBeGreaterThan(0);
            expect(getResponse.body.time_left).toBeLessThanOrEqual(timerTimeoutSec);
        });

        it("should return the status code 404 if a timer with a requested ID does not exist", async () => {
            const res = await got(makeApiUrl("56774747"), { throwHttpErrors: false });
            expect(res.statusCode).toEqual(404);
        });
    });
});
