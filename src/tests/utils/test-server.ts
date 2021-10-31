import http from "http";
import {promisify} from "util";

const defaultTestServerHost = "localhost";
const testServerHost = process.env.TIMERS_TEST_SERVER_HOST ?? defaultTestServerHost;
const defaultTestServerPort = 18080;
const envPort = parseInt(process.env.TIMERS_TEST_SERVER_PORT, 10);
const testServerPort = isNaN(envPort) ? defaultTestServerPort : envPort;

export default class testServer {

    private readonly httpApiEndpoint;
    private server: http.Server;
    private requestsReceived: Array<string> = [];

    constructor(httpApiEndpoint: string){
        this.httpApiEndpoint = httpApiEndpoint;
    }

    public async createServer(){
        this.server = http.createServer( (req, res) => {
            const match = /\/test\/([\d\w\-]*)\/(\d+)/.exec(req.url);
            if (match.length < 2) {
                res.statusCode = 404;
            } else {
                this.requestsReceived.push(match[1]);
            }
            res.end();
        });
        const listen = promisify(this.server.listen.bind(this.server));
        await listen(testServerPort, testServerHost);
        this.server.unref();
    }

    public makeWebhookUrl(testId: string): string {
        return `http://${testServerHost}:${testServerPort}/test/${testId}`;
    }

    public isWebhookFired(testId: string): boolean {
        return this.requestsReceived.includes(testId)
    }


}