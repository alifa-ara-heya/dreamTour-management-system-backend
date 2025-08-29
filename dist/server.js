"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const env_1 = require("./app/config/env");
const seedSuperAdmin_1 = require("./app/utils/seedSuperAdmin");
const redis_config_1 = require("./app/config/redis.config");
let server;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // console.log(envvars.PORT);
        console.log(`Attempting to connect to DB`);
        yield mongoose_1.default.connect(env_1.envVars.DB_URL);
        console.log('Connected to MongoDB');
        server = app_1.default.listen(5000, () => {
            console.log(`Server is listening to port ${env_1.envVars.PORT}`);
        });
    }
    catch (error) {
        console.log('error connecting to mongoDB', error);
    }
});
/* startServer();
superAdmin(); */
// but we need to run these functions one by one after starting the server, that's why we will use IIFE inside async
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, redis_config_1.connectRedis)();
    yield startServer();
    yield (0, seedSuperAdmin_1.superAdmin)(); //to create a superAdmin, if it doesn't exist
}))();
// unhandled rejection error
process.on("unhandledRejection", (err) => {
    console.log('Unhandled Rejection detected! Server shutting down..', err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
// Promise.reject(new Error("I forgot to catch this promise"))
// unhandled exception error
process.on("uncaughtException", (err) => {
    console.log('Uncaught Exception detected! Server shutting down..', err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
// throw new Error("I forgot to handle this local error.")
// signal termination error- the server owner causes this error, such as for maintenance
process.on("SIGTERM", (err) => {
    console.log('Sigterm signal received! Server shutting down..', err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
process.on("SIGINT", (err) => {
    console.log('Sigint signal received! Server shutting down..', err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
