import { Response } from "express";

interface TMeta {
    total: number;
}

interface TResponse<T> {
    statusCode: number;
    success: boolean;
    message: string;
    data: T;
    meta?: TMeta;
} //why <T>? because we don't know what type of data we will get from the user

export const sendResponse = <T>(res: Response, data: TResponse<T>) => {

    res.status(data.statusCode).json({
        statusCode: data.statusCode,
        success: data.success,
        message: data.message,
        meta: data.meta,
        data: data.data
    })
}