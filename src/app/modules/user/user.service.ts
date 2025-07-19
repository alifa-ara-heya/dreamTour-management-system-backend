import httpStatus from 'http-status-codes';
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import AppError from '../../errorHelpers/appError';
import bcryptjs from 'bcryptjs'
import { envVars } from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';

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

// todo - needs to fix the logic
const updateUsers = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {
    /* 
    email- cannot update
    name, phone, password - can update
    password - rehashing
    only admin, super-admin can update role, isDeleted
    promoting to super admin- only super-admin can do this */

    // Fetch the user document to check if it exists
    const ifUserExist = await User.findById(userId);

    if (!ifUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    }

    console.log('userId', userId);
    console.log('decodedId', decodedToken.userId);

    // Security check: A regular user or guide can only update their own profile
    // const isUserOrGuide = decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE;
    // const isUpdatingSelf = decodedToken.userId === userId;

    // if (isUserOrGuide && !isUpdatingSelf) {
    //     throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update another user's profile.")
    // }

    // // prevent email updates as it's a unique identifier
    // if (payload.email) {
    //     throw new AppError(httpStatus.BAD_REQUEST, "Updating email address is not allowed.");
    // }

    // Check if the role is being updated and if the requester has the necessary permissions - this block is only triggered if the request includes an attempt to update the user's role (
    if (payload.role) {
        console.log("decodedToken", decodedToken);

        // Only admins and super admins can update roles- regular users (those with "USER" or "GUIDE" roles) cannot update any user's role except their own.
        if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to change user roles.")
        }

        // only a superAdmin can update his profile
        if (decodedToken.role === Role.ADMIN && ifUserExist.role === Role.SUPER_ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update a super admin profile");
        }

        // Only super admins can promote a user to super admin
        if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to promote a user to super admin")
        }
    }

    // If the request attempts to update isActive, isDeleted, or isVerified fields, the code verifies that the requester has admin or super-admin roles.

    if (payload.isActive || payload.isDeleted || payload.isVerified) {

        // Only admins and super admins can update these properties
        if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized")
        }
    }

    // If a new password is provided, hash it before updating
    if (payload.password) {
        payload.password = await bcryptjs.hash(payload.password, Number(envVars.BCRYPT_SALT_ROUND))
    }

    // Update the user document with the provided payload
    const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
        new: true,  // Return the updated document
        runValidators: true // Run model validation on the update
    })

    return newUpdatedUser;
}


export const UserServices = {
    createUser,
    getAllUsers,
    updateUsers
}

