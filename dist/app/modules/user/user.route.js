"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
// import  jwt,{ JwtPayload } from 'jsonwebtoken';
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const user_validation_1 = require("./user.validation");
const validateRequest_1 = require("../../middlewares/validateRequest");
// import AppError from '../../errorHelpers/AppError';
// import { Role } from './user.interface';
// import { verifyToken } from '../../utils/jwt';
// import { envVars } from '../../config/env';
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("./user.interface");
const router = (0, express_1.Router)();
// higher order function
/* const checkAuth = (...authRoles: string[]) => async (req: Request, re: Response, next: NextFunction) => {
    try {
        const accessToken = req.headers.authorization;

        if (!accessToken) {
            throw new AppError(403, "No token received")
        }

        // const verifiedToken = jwt.verify(accessToken as string, "secret")


        /* console.log(verifiedToken);  {
             userId: '68746141d95fb7ab0b7c50c2',
             email: 'm@vmail.com',
             role: 'USER',
             iat: 1752536499,
             exp: 1752622899
             } */
/* if (!verifiedToken) {
    console.log(verifiedToken);
    throw new AppError(403, `You are not authorized`, verifiedToken)
} */ //not needed
// now go to the postman, edit you headers to add authorization, add the token value you got logging a user and try to get all the users. With this right token you will get all users. But if you try to edit the token and make an error willingly, you will get JsonWebTokenError
// const verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET) as JwtPayload
/*   if ((verifiedToken as JwtPayload).role !== Role.ADMIN && Role.SUPER_ADMIN) {
      throw new AppError(403, 'You are not permitted to view this route.')
  } */
/* another way to write this-
const role = (verifiedToken as JwtPayload).role;

if (role !== Role.ADMIN && role !== Role.SUPER_ADMIN) {
    throw new AppError(403, 'You are not permitted to view this route.');
} */
// another way to write this logic using "includes"
// if (!authRoles.includes(verifiedToken.role)) {
//     throw new AppError(403, "You are not permitted to view this route!")
// }
//now no user with the role "User" can access this route with his token.
// next();
/*   } catch (error) {
      console.log('jwt error', error);
      next(error) //to handle the error by globalErrorHandler
  } */
// }
// router.post("/register", UserControllers.createUser)
//we want to validate and sanitize when registering someone
router.post("/register", 
// checking input
/*  req.body = await createUserZodSchema.parseAsync(req.body)
 console.log(req.body); */
//pass it to controller
// next()
(0, validateRequest_1.validateRequest)(user_validation_1.createUserZodSchema), user_controller_1.UserControllers.createUser);
router.get('/all-users', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), user_controller_1.UserControllers.getAllUsers);
router.get("/me", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), user_controller_1.UserControllers.getMe);
router.get("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), user_controller_1.UserControllers.getSingleUser);
//update route- api/v1/user/:id
router.patch("/:id", (0, validateRequest_1.validateRequest)(user_validation_1.updateUserZodSchema), (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), user_controller_1.UserControllers.updateUser);
// Object.values(Role): This JavaScript method returns an array of the values from the Role enum: ["SUPER_ADMIN", "ADMIN", "USER", "GUIDE"]
// ...Object.values(Role): The spread syntax (...) expands this array into individual arguments. So, the checkAuth function is called like this: checkAuth("SUPER_ADMIN", "ADMIN", "USER", "GUIDE").
exports.userRoutes = router;
