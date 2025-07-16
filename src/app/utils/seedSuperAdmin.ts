import bcryptjs from 'bcryptjs';
// Making a super admin if no super admin exists when we restart our server 

import { envVars } from "../config/env"
import { User } from "../modules/user/user.model"
import { IAuthProvider, IUser, Role } from '../modules/user/user.interface';

export const superAdmin = async () => {
    try {
        const isSuperAdminExists = await User.findOne({ email: envVars.SUPER_ADMIN_EMAIL })

        if (isSuperAdminExists) {
            console.log("Super Admin already exists");
            return
        }

        console.log('Trying to create super admin');

        const hashedPassword = await bcryptjs.hash(envVars.SUPER_ADMIN_PASSWORD, envVars.BCRYPT_SALT_ROUND)

        const authProvider: IAuthProvider = {
            provider: 'credentials',
            providerId: envVars.SUPER_ADMIN_EMAIL
        }

        const payload: IUser = {
            name: "super admin",
            role: Role.SUPER_ADMIN,
            email: envVars.SUPER_ADMIN_EMAIL,
            password: hashedPassword,
            isVerified: true,
            auths: [authProvider]
        }

        const superAdmin = await User.create(payload)

        console.log('super-admin created successfully', superAdmin);

    } catch (error) {
        console.log(error)
    }
}