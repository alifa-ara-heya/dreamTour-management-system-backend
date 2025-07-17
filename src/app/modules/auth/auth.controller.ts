import httpStatus from 'http-status-codes';
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import { NextFunction, Request, Response } from 'express';
import { AuthServices } from './auth.service';
import AppError from '../../errorHelpers/appError';
import { setAuthCookie } from '../../utils/setCookie';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const loginInfo = await AuthServices.credentialsLogin(req.body)

    /*   res.cookie("accessToken", loginInfo.accessToken, {
          httpOnly: true, //ensures that these cookies cannot be accessed via client-side JavaScript, which helps protect them from cross-site scripting (XSS) attacks.
          secure: false //means the cookies will be sent over both HTTP and HTTPS connections. In production environments, it is recommended to set secure: true so that cookies are only sent over secure HTTPS connections, further protecting sensitive authentication tokens.
      }) */

    /* 
        res.cookie('refreshToken', loginInfo.refreshToken, {
            httpOnly: true,
            secure: false
        }) */

    setAuthCookie(res, loginInfo)


    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged in successfully",
        data: loginInfo
    })
})

// get new access token
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, "No refresh token received from cookies.")
    }
    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken as string)

    res.cookie("accessToken", tokenInfo.accessToken, {
        httpOnly: true,
        secure: false
    })


    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "New Access Token Retrieved Successfully",
        data: tokenInfo
    })
})

export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken
}