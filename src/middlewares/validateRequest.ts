import { NextFunction, Request, Response } from "express"
import { AnyZodObject } from "zod"

/* 
validateRequest is a higher-order function:

It takes a Zod schema (zodSchema) as an argument.
It returns an Express middleware function (async (req, res, next) => { ... }).  */

export const validateRequest = (zodSchema: AnyZodObject) =>
    async (req: Request, res: Response, next: NextFunction) => {
        // checking input
        try {
            // console.log('old body', req.body);
            req.body = await zodSchema.parseAsync(req.body)
            // console.log('new body', req.body);
            next()
        } catch (error) {
            next(error)
        }
    }