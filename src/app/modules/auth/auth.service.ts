import AppError from "../../errorHelpers/appError"
import httpStatus from 'http-status-codes';
import { IUser } from "../user/user.interface"
import { User } from "../user/user.model"
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

const credentialsLogin = async (payload: Partial<IUser>) => {
    const { email, password } = payload
    const isUserExist = await User.findOne({ email })
    console.log('isUserExist', isUserExist);

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "Email doesn't exist")
    }

    const isPassWordMatch = await bcryptjs.compare(password as string, isUserExist.password as string)

    if (!isPassWordMatch) {
        throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password")
    }

    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role
    }

    const accessToken = jwt.sign(jwtPayload, "secret", {
        expiresIn: "1d"
    })

    return {
        // email: isUserExist.email
        accessToken //you should now see the accessToken in postman, copy the token, post in jwt website to see what's actually in there
    }

}

// user => login => token (email, role, _id)

export const AuthServices = {
    credentialsLogin
}