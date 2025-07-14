import { NextFunction, Request, Response } from "express";
import httpStatus from 'http-status-codes';
import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
// import AppError from "../../../errorHelpers/AppError";

/* type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>

const catchAsync = (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err: any) => {
        console.log(err);
        next(err)
    })
} */

/* const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //  const { name, email } = req.body;
        // const user = await User.create({
        //     name,
        //     email
        // })  //controller should not handle this business logic, move to service.ts
        // throw new AppError(httpStatus.BAD_REQUEST, 'fake error')

        const user = await UserServices.createUser(req.body)

        res.status(httpStatus.CREATED).json({
            message: 'User created successfully!',
            user
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.log(error);
        //  res.status(httpStatus.BAD_REQUEST).json({
        //     message: `Something went wrong! The error is ${error.message}`,
        //     error 
        // }
        next(error) //global error handler
    }
} */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body)

    /*  res.status(httpStatus.CREATED).json({
         message: "User created successfully",
         user
     }) */
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User created successfully",
        data: user
    })
})

// getting all users

/* const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await UserServices.getAllUsers()

        res.status(httpStatus.OK).json({
            message: 'Users retrieved successfully',
            users
        })
    } catch (error) {
        next(error)
    }
} */


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getAllUsers = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const result = await UserServices.getAllUsers();

    /* res.status(httpStatus.OK).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users
    }) */
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "All Users retrieved successfully",
        data: result.data,
        meta: result.meta
    })
})


export const UserControllers = {
    createUser,
    getAllUsers
}

// route matching -> controller -> service -> model -> db
// 1st create model, then service, then use that function in controller, the use the controller in route