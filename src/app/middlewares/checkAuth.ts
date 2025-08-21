import httpStatus from 'http-status-codes';
import AppError from "../errorHelpers/AppError";
import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../modules/user/user.model";
import { IsActive } from '../modules/user/user.interface';


export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.headers.authorization;

        if (!accessToken) {
            throw new AppError(403, "No token received")
        }

        // const verifiedToken = jwt.verify(accessToken as string, "secret")


        /* console.log(verifiedToken);  {
             userId: '68746141d95fb7ab0b7c50c2',
             email: 'm@vmail.com',
             role: 'USER',
             iat: 1752536499,
             exp: 1752622899
             } */

        /* if (!verifiedToken) {
            console.log(verifiedToken);
            throw new AppError(403, `You are not authorized`, verifiedToken)
        } */ //not needed

        // now go to the postman, edit you headers to add authorization, add the token value you got logging a user and try to get all the users. With this right token you will get all users. But if you try to edit the token and make an error willingly, you will get JsonWebTokenError

        const verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET) as JwtPayload

        const isUserExist = await User.findOne({ email: verifiedToken.email })
        // console.log('isUserExist', isUserExist);

        if (!isUserExist) {
            throw new AppError(httpStatus.BAD_REQUEST, "User doesn't exist")
        }

        if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
            throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
        }

        if (isUserExist.isDeleted) {
            throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
        }



        /*   if ((verifiedToken as JwtPayload).role !== Role.ADMIN && Role.SUPER_ADMIN) {
              throw new AppError(403, 'You are not permitted to view this route.')
          } */

        /* another way to write this-
        const role = (verifiedToken as JwtPayload).role;

        if (role !== Role.ADMIN && role !== Role.SUPER_ADMIN) {
            throw new AppError(403, 'You are not permitted to view this route.');
        } */

        // another way to write this logic using "includes"
        if (!authRoles.includes(verifiedToken.role)) {
            throw new AppError(403, "You are not permitted to view this route!")
        }

        req.user = verifiedToken //we declared a global type for it in app> interface> index.d.ts


        //now no user with the role "User" can access this route with his token.
        next();


    } catch (error) {
        console.log('jwt error', error);
        next(error) //to handle the error by globalErrorHandler
    }

}