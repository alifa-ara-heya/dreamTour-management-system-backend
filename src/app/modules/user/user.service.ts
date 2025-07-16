import httpStatus from 'http-status-codes';
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";
import AppError from '../../errorHelpers/appError';
import bcryptjs from 'bcryptjs'
import { envVars } from '../../config/env';

const createUser = async (payload: Partial<IUser>) => {
    /*  const { name, email } = payload;
     const user = await User.create({
         name,
         email
     })
     return user */
    const { email, password, ...rest } = payload;

    const isUserExist = await User.findOne({ email })

    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User already exists')
    }

    const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND))

    // console.log(hashedPassword);

    const authProvider: IAuthProvider = {
        provider: "credentials",
        providerId: email as string //why as string, because ts doesn't know that it must be a string, but I am sure. email! is also okay
    }

    const user = await User.create({
        email,
        password: hashedPassword,
        auths: [authProvider],
        ...rest
    })

    return user
}

const getAllUsers = async () => {
    const users = await User.find({});

    const totalUsers = await User.countDocuments()
    return {
        data: users,
        meta: {
            total: totalUsers
        }
    }
}

export const UserServices = {
    createUser,
    getAllUsers
}

