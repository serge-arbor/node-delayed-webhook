import { app } from "./app";

const defaultPort = 10080;

async function main(): Promise<void> {
    const port = process.env.PORT ?? defaultPort;
    app.listen(port);
}

function halt(error: Error) {
    console.error(error.stack ?? error.message);
    process.exit(1);
}

main().catch(halt);
