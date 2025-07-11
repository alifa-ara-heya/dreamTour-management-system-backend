/* eslint-disable no-console */
import { Server } from "http";

import mongoose from 'mongoose';
import app from "./app";
import { envVars } from "./app/config/env";

let server: Server;

const startServer = async () => {
    try {
        await mongoose.connect(envVars.DB_URL)

        console.log('Connected to MongoDB');

        server = app.listen(5000, () => {
            console.log(`Server is listening to port ${envVars.PORT}`);
        })
    } catch (error) {
        console.log('error connecting to mongoDB', error);
    }
}

startServer();

// unhandled rejection error
process.on("unhandledRejection", (err) => {
    console.log('Unhandled Rejection detected! Server shutting down..', err);

    if (server) {
        server.close(() => {
            process.exit(1)
        });
    }

    process.exit(1)
})

// Promise.reject(new Error("I forgot to catch this promise"))


// unhandled exception error
process.on("uncaughtException", (err) => {
    console.log('Uncaught Exception detected! Server shutting down..', err);

    if (server) {
        server.close(() => {
            process.exit(1)
        });
    }

    process.exit(1)
})

// throw new Error("I forgot to handle this local error.")


// signal termination error- the server owner causes this error, such as for maintenance
process.on("SIGTERM", (err) => {
    console.log('Sigterm signal received! Server shutting down..', err);

    if (server) {
        server.close(() => {
            process.exit(1)
        });
    }

    process.exit(1)
})

process.on("SIGINT", (err) => {
    console.log('Sigint signal received! Server shutting down..', err);

    if (server) {
        server.close(() => {
            process.exit(1)
        });
    }

    process.exit(1)
})

