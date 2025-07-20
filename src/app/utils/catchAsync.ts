import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
// import { RequestHandler } from "express";

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>

export const catchAsync = (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
        if (envVars.NODE_ENV === 'development') {
            console.log(err);
        }
        next(err)
    })
}

/* export const catchAsync = (fn: RequestHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch((err) => next(err));
    };
};
 */
// We can make one small improvement by using the built-in RequestHandler type from Express, which makes your custom AsyncHandler type unnecessary. 