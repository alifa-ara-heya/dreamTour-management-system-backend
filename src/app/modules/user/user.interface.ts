import { Types } from 'mongoose';
export enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    USER = "USER",
    GUIDE = "GUIDE"
}

/* 
auth providers
- email, password
- google authentication
*/

export interface IAuthProvider {
    provider: "google" | "credentials"; //Google, credential = email+password
    providerId: string;
}

export enum IsActive {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    BLOCKED = 'BLOCKED',
}

export interface IUser {
    _id?: Types.ObjectId;
    name: string;
    email: string;
    password?: string; //optional because in google login, user doesn't necessarily need a password
    phone?: string;
    picture?: string;
    address?: string;
    isDeleted?: boolean;
    isActive?: IsActive
    isVerified?: boolean;
    role: Role;
    auths: IAuthProvider[]; //this is an array because even if the user uses google login, he might later update his password to convert the google login to a credential based login
    bookings?: Types.ObjectId[] //the booking ids of a user
    guides?: Types.ObjectId[] //which guides guided this user
}