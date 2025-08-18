import AppError from "../../errorHelpers/AppError"
import httpStatus from 'http-status-codes';
import { /* IsActive,  */ IUser } from "../user/user.interface"
import { User } from "../user/user.model"
import bcryptjs from 'bcryptjs'
// import jwt from 'jsonwebtoken'
// import { generateToken } from "../../utils/jwt";
// import { envVars } from "../../config/env";
import { createNewAccessTokenWithRefreshToken, createUserTokens } from "../../utils/userTokens";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
// import { generateToken, verifyToken } from "../../utils/jwt";
// import { envVars } from "../../config/env";
// import { JwtPayload } from "jsonwebtoken";

const credentialsLogin = async (payload: Partial<IUser>) => {
    const { email, password } = payload
    // It's good practice to explicitly select the password field if it is set to `select: false` in your User schema.
    const isUserExist = await User.findOne({ email }).select('+password')
    console.log('isUserExist', isUserExist);

    if (!isUserExist) {
        // Using a generic error message for non-existent user to prevent user enumeration attacks.
        throw new AppError(httpStatus.UNAUTHORIZED, "Incorrect email or password")
    }

    const isPassWordMatch = await bcryptjs.compare(password as string, isUserExist.password as string)

    if (!isPassWordMatch) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Incorrect email or password")
    }

    // const jwtPayload = {
    //     userId: isUserExist._id,
    //     email: isUserExist.email,
    //     role: isUserExist.role
    // }

    // /*  const accessToken = jwt.sign(jwtPayload, "secret", {
    //      expiresIn: "1d"
    //  }) */

    // const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES)

    // const refreshToken = generateToken(jwtPayload, envVars.JWT_REFRESH_SECRET, envVars.JWT_REFRESH_EXPIRES)

    const userTokens = createUserTokens(isUserExist)

    const userObj = isUserExist.toObject();

    delete userObj.password; //This is a common practice in authentication or user management systems to ensure sensitive information, such as hashed passwords, is not accidentally exposed or sent to the client.

    return {
        // email: isUserExist.email
        accessToken: userTokens.accessToken, //you should now see the accessToken in postman, copy the token, post in jwt website to see what's actually in there
        refreshToken: userTokens.refreshToken,
        user: userObj
    }

}
const getNewAccessToken = async (refreshToken: string) => {
    /* const verifiedRefreshToken = verifyToken(refreshToken, envVars.JWT_REFRESH_SECRET) as JwtPayload;

    const isUserExist = await User.findOne({ email: verifiedRefreshToken.email })
    console.log('isUserExist', isUserExist);

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User doesn't exist")
    }

    if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
        throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
    }

    if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
    }

    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role
    }

    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES) */

    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken)

    return {
        accessToken: newAccessToken
    }

}

// user - login - token (email, role, _id) - booking / payment / booking / payment cancel - token

const resetPassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {

    const user = await User.findById(decodedToken.userId)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const isOldPasswordMatch = await bcryptjs.compare(oldPassword, user!.password as string)

    if (!isOldPasswordMatch) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Old Password does not match')
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    user!.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND))

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await user!.save();
    // return true // Without returning true, the calling function or client might incorrectly assume that the password reset was unsuccessful.

}



export const AuthServices = {
    credentialsLogin,
    getNewAccessToken,
    resetPassword
}