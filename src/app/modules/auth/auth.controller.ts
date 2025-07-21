import httpStatus from 'http-status-codes';
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import { NextFunction, Request, Response } from 'express';
import { AuthServices } from './auth.service';
import AppError from '../../errorHelpers/AppError';
import { setAuthCookie } from '../../utils/setCookie';
import { createUserTokens } from '../../utils/userTokens';
import { envVars } from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';
import passport from 'passport';

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    // const loginInfo = await AuthServices.credentialsLogin(req.body)
    // instead of our AuthService to login with email, password, we will use passport now.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    passport.authenticate("local", async (err: any, user: any, info: any) => {

        if (err) {
            // return next(err)
            return next(new AppError(401, err))
            // return new AppError(401, err) - not right
        }

        if (!user) {
            // return new AppError(401, info.message) - not right
            return next(new AppError(401, info.message))

        }

        const userTokens = await createUserTokens(user)

        delete user.toObject().password

        setAuthCookie(res, userTokens)

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "User logged in successfully",
            data: {
                accessToken: userTokens.accessToken,
                refreshToken: userTokens.refreshToken,
                user
            }
        })
    })(req, res, next)

    /*   res.cookie("accessToken", loginInfo.accessToken, {
          httpOnly: true, //ensures that these cookies cannot be accessed via client-side JavaScript, which helps protect them from cross-site scripting (XSS) attacks.
          secure: false //means the cookies will be sent over both HTTP and HTTPS connections. In production environments, it is recommended to set secure: true so that cookies are only sent over secure HTTPS connections, further protecting sensitive authentication tokens.
      }) */

    /* 
        res.cookie('refreshToken', loginInfo.refreshToken, {
            httpOnly: true,
            secure: false
        }) */

    /* setAuthCookie(res, loginInfo)


    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged in successfully",
        data: loginInfo
    }) */
})

// get new access token
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, "No refresh token received from cookies.")
    }
    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken as string)

    // res.cookie("accessToken", tokenInfo.accessToken, {
    //     httpOnly: true,
    //     secure: false
    // })

    setAuthCookie(res, tokenInfo)


    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "New Access Token Retrieved Successfully",
        data: tokenInfo
    })
})


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })


    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Logged Out Successfully",
        data: null
    })
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user

    await AuthServices.resetPassword(oldPassword, newPassword, decodedToken as JwtPayload)


    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Password changed Successfully",
        data: null
    })
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const googleCallbackController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let redirectTo = req.query.state ? req.query.state as string : '';

    if (redirectTo.startsWith('/')) {
        redirectTo = redirectTo.slice(1)
    }
    const user = req.user

    console.log("user", user);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    }

    const tokenInfo = createUserTokens(user)

    setAuthCookie(res, tokenInfo)

    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`)
})


// 

export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logout,
    resetPassword,
    googleCallbackController
}