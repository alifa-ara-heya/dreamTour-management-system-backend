import { Request, Response } from "express";
import httpStatus from 'http-status-codes';
import { UserServices } from "./user.service";

const createUser = async (req: Request, res: Response) => {
    try {
        /* const { name, email } = req.body;
        const user = await User.create({
            name,
            email
        })  *///controller should not handle this business logic, move to service.ts

        const user = await UserServices.createUser(req.body)

        res.status(httpStatus.CREATED).json({
            message: 'User created successfully!',
            user
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.log(error);
        res.status(httpStatus.BAD_REQUEST).json({
            message: `Something went wrong! The error is ${error.message}`
        })
    }
}

export const UserControllers = {
    createUser
}

// route matching -> controller -> service -> model -> db
// 1st create model, then service, then use that function in controller, the use the controller in route