import z from "zod";
import { IsActive, Role } from "./user.interface";

export const createUserZodSchema = z.object({
    name: z
        .string({ invalid_type_error: "Name Must be String" })
        .min(2,
            { message: "Name is too short. Minimum length should be 2 characters." })
        .max(50,
            { message: "Name is too long." }),
    email: z
        .string({
            invalid_type_error: "Email must be a string",
        })
        .email({ message: "Invalid email address format." })
        .min(5, { message: "Email must be at least 5 characters long." })
        .max(100, { message: "Email cannot exceed 100 characters." }),
    // password requirements: 1 uppercase, 1 special character, 1 digit, 8 characters min
    password: z
        .string({
            required_error: 'Password is required',
        }).min(6)
        .regex(/[A-Z]/,
            { message: 'Password must contain at least one uppercase letter' })
        .regex(/[a-z]/,
            { message: 'Password must contain at least one lowercase letter' })
        .regex(/[0-9]/,
            { message: 'Password must contain at least one number' })
        .regex(/[^A-Za-z0-9]/,
            { message: 'Password must contain at least one special character' }),
    phone: z
        .string({ invalid_type_error: "Phone Number must be a string" })
        .regex(
            /^(?:\+8801[3-9]\d{8}|01[3-9]\d{8})$/,
            { message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX" }
        )
        .optional(), // Making phone optional
    address: z
        .string({ invalid_type_error: "Address must be a string" })
        .max(200, { message: "Address cannot exceed 200 characters." })
        .optional(), // Making address optional
})


export const updateUserZodSchema = z.object({
    name: z
        .string({ invalid_type_error: "Name Must be String" })
        .min(2,
            { message: "Name is too short. Minimum length should be 2 characters." })
        .max(50,
            { message: "Name is too long." })
        .optional(), //createUserZodSchema did not have it, because it was required then. but for updating, this is optional

    // password requirements: 1 uppercase, 1 special character, 1 digit, 8 characters min
    password: z
        .string({
            required_error: 'Password is required',
        }).min(6)
        .regex(/[A-Z]/,
            { message: 'Password must contain at least one uppercase letter' })
        .regex(/[a-z]/,
            { message: 'Password must contain at least one lowercase letter' })
        .regex(/[0-9]/,
            { message: 'Password must contain at least one number' })
        .regex(/[^A-Za-z0-9]/,
            { message: 'Password must contain at least one special character' })
        .optional(),
    phone: z
        .string({ invalid_type_error: "Phone Number must be a string" })
        .regex(
            /^(?:\+8801[3-9]\d{8}|01[3-9]\d{8})$/,
            { message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX" }
        )
        .optional(), // Making phone optional
    address: z
        .string({ invalid_type_error: "Address must be a string" })
        .max(200, { message: "Address cannot exceed 200 characters." })
        .optional(), // Making address optional

    // the following fields are to be updated by only the admin
    role: z
        .enum(Object.values(Role) as [string])
        .optional(),
    isActive: z
        .enum(Object.values(IsActive) as [string]) //type assertion to the string
        .optional(),
    isDeleted: z
        .boolean({ invalid_type_error: 'isDeleted must be true or false' })
        .optional(),
    isVerified: z
        .boolean({ invalid_type_error: 'isDeleted must be true or false' })
        .optional(),



})
