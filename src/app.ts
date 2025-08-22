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
app.use(expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session())
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors())

// app.use("/api/v1/user", userRoutes)
// we need to organize it, so moved it to routes/index.ts

app.use("/api/v1", router)


app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Welcome to tour management system backend"
    })
})

// global error handler
app.use(globalErrorHandler)

// not found route (must be used after global error handler)
app.use(notFound)



export default app;

