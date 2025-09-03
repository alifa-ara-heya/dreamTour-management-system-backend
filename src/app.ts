import express, { Request, Response } from "express";
// import { userRoutes } from "./app/modules/user/user.route";
import cors from "cors";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notfound";
import cookieParser from 'cookie-parser';
import passport from "passport";
import expressSession from 'express-session';
// import passport config
import "./app/config/passport"
import { envVars } from "./app/config/env";


const app = express();
// 1. Trust the proxy to get correct IP and protocol from Vercel
app.set("trust proxy", 1);

// 2. Enable CORS for all routes
app.use(cors({
    origin: envVars.FRONTEND_URL,
    credentials: true
}));

// 3. Parse cookies
app.use(cookieParser());

// 4. Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Set up session and passport (if you use them)
app.use(expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// 6. Your API routes
app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Welcome to tour management system backend"
    });
});

// 7. Your error handlers
app.use(globalErrorHandler);
app.use(notFound);

export default app;