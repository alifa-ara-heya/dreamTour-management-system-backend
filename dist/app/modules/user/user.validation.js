"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserZodSchema = exports.createUserZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const user_interface_1 = require("./user.interface");
exports.createUserZodSchema = zod_1.default.object({
    name: zod_1.default
        .string({ invalid_type_error: "Name Must be String" })
        .min(2, { message: "Name is too short. Minimum length should be 2 characters." })
        .max(50, { message: "Name is too long." }),
    // name: z.object({
    //     firstName: z.string({ invalid_type_error: "Name must be string" })
    //         .min(2, { message: "Name must be at least 2 characters long." })
    //         .max(50, { message: "Name cannot exceed 50 characters." }),
    //     lastName: z.object({
    //         nickName: z.string({ invalid_type_error: "Name must be string" })
    //             .min(2, { message: "Name must be at least 2 characters long." })
    //             .max(50, { message: "Name cannot exceed 50 characters." }),
    //         surName: z.string({ invalid_type_error: "Name must be string" })
    //             .min(2, { message: "Name must be at least 2 characters long." })
    //             .max(50, { message: "Name cannot exceed 50 characters." }),
    //     })
    // }),
    email: zod_1.default
        .string({
        invalid_type_error: "Email must be a string",
    })
        .email({ message: "Invalid email address format." })
        .min(5, { message: "Email must be at least 5 characters long." })
        .max(100, { message: "Email cannot exceed 100 characters." }),
    // password requirements: 1 uppercase, 1 special character, 1 digit, 8 characters min
    password: zod_1.default
        .string({
        required_error: 'Password is required',
    }).min(6)
        .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
        .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
        .regex(/[0-9]/, { message: 'Password must contain at least one number' })
        .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' }),
    phone: zod_1.default
        .string({ invalid_type_error: "Phone Number must be a string" })
        .regex(/^(?:\+8801[3-9]\d{8}|01[3-9]\d{8})$/, { message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX" })
        .optional(), // Making phone optional
    address: zod_1.default
        .string({ invalid_type_error: "Address must be a string" })
        .max(200, { message: "Address cannot exceed 200 characters." })
        .optional(), // Making address optional
});
exports.updateUserZodSchema = zod_1.default.object({
    name: zod_1.default
        .string({ invalid_type_error: "Name Must be String" })
        .min(2, { message: "Name is too short. Minimum length should be 2 characters." })
        .max(50, { message: "Name is too long." })
        .optional(), //createUserZodSchema did not have it, because it was required then. but for updating, this is optional
    // password requirements: 1 uppercase, 1 special character, 1 digit, 8 characters min
    phone: zod_1.default
        .string({ invalid_type_error: "Phone Number must be a string" })
        .regex(/^(?:\+8801[3-9]\d{8}|01[3-9]\d{8})$/, { message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX" })
        .optional(), // Making phone optional
    address: zod_1.default
        .string({ invalid_type_error: "Address must be a string" })
        .max(200, { message: "Address cannot exceed 200 characters." })
        .optional(), // Making address optional
    // the following fields are to be updated by only the admin
    role: zod_1.default
        .enum(Object.values(user_interface_1.Role))
        .optional(),
    isActive: zod_1.default
        .enum(Object.values(user_interface_1.IsActive)) //type assertion to the string
        .optional(),
    isDeleted: zod_1.default
        .boolean({ invalid_type_error: 'isDeleted must be true or false' })
        .optional(),
    isVerified: zod_1.default
        .boolean({ invalid_type_error: 'isDeleted must be true or false' })
        .optional(),
});
