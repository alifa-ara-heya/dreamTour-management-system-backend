/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from 'http-status-codes';
import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";


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
const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await UserServices.getAllUsers(query as Record<string, string>);

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

// updating users
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    // const token = req.headers.authorization;
    // const verifiedToken = verifyToken(token as string, envVars.JWT_ACCESS_SECRET) as JwtPayload;

    const verifiedToken = req.user; ////we declared a global type for it in app> interface> index.d.ts
    const payload = req.body;


    const user = await UserServices.updateUsers(userId, payload, verifiedToken as JwtPayload)
    /*  res.status(httpStatus.CREATED).json({
         message: "User created successfully",
         user
     }) */
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User updated successfully",
        data: user
    })
})

const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload
    const result = await UserServices.getMe(decodedToken.userId);

    // res.status(httpStatus.OK).json({
    //     success: true,
    //     message: "All Users Retrieved Successfully",
    //     data: users
    // })
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Your profile Retrieved Successfully",
        data: result.data
    })
})

const getSingleUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await UserServices.getSingleUser(id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Retrieved Successfully",
        data: result.data
    })
})


export const UserControllers = {
    createUser,
    getAllUsers,
    updateUser,
    getMe,
    getSingleUser
}

// route matching -> controller -> service -> model -> db
// 1st create model, then service, then use that function in controller, the use the controller in route