import { startWorker } from "./worker";

const defaultRedisUrl = "localhost:6379";

async function main(): Promise<void> {
    const redisUrl = process.env.REDIS_URL || defaultRedisUrl;
    startWorker(redisUrl);
}

function halt(error: Error) {
    console.error(error.stack ?? error.message);
    process.exit(1);
}

main().catch(halt);
