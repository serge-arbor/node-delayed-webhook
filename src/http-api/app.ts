import express from "express";
import type { Request, Response, Handler } from "express";
import { json } from "body-parser";
import compression from "compression";
import errorhandler from "errorhandler";
import morgan from "morgan";
import { routes } from "./routes";
import swagger from "./swagger";
const redisUrl = process.env.REDIS_URL;
export const app = express();

app.use(morgan("tiny"));
app.use(compression());
app.use(json());
app.use(routes(redisUrl));
app.use(swagger);

if (process.env.DEBUG) {
    app.use(errorhandler());
} else {
    app.use((error: Error, req: Request, res: Response, next: Handler): void => {
        res.json({ error: "unexpected error" });
    });
}
