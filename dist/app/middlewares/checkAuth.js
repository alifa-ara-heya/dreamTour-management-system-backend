"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const jwt_1 = require("../utils/jwt");
const env_1 = require("../config/env");
const user_model_1 = require("../modules/user/user.model");
const user_interface_1 = require("../modules/user/user.interface");
const checkAuth = (...authRoles) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = req.headers.authorization;
        if (!accessToken) {
            throw new AppError_1.default(403, "No token received");
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
        const verifiedToken = (0, jwt_1.verifyToken)(accessToken, env_1.envVars.JWT_ACCESS_SECRET);
        const isUserExist = yield user_model_1.User.findOne({ email: verifiedToken.email });
        // console.log('isUserExist', isUserExist);
        if (!isUserExist) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User doesn't exist");
        }
        if (isUserExist.isActive === user_interface_1.IsActive.BLOCKED || isUserExist.isActive === user_interface_1.IsActive.INACTIVE) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `User is ${isUserExist.isActive}`);
        }
        if (isUserExist.isDeleted) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is deleted");
        }
        if (!isUserExist.isVerified) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is not verified.");
        }
        /*   if ((verifiedToken as JwtPayload).role !== Role.ADMIN && Role.SUPER_ADMIN) {
              throw new AppError(403, 'You are not permitted to view this route.')
          } */
        /* another way to write this-
        const role = (verifiedToken as JwtPayload).role;

        if (role !== Role.ADMIN && role !== Role.SUPER_ADMIN) {
            throw new AppError(403, 'You are not permitted to view this route.');
        } */
        // another way to write this logic using "includes"
        if (!authRoles.includes(verifiedToken.role)) {
            throw new AppError_1.default(403, "You are not permitted to view this route!");
        }
        req.user = verifiedToken; //we declared a global type for it in app> interface> index.d.ts
        //now no user with the role "User" can access this route with his token.
        next();
    }
    catch (error) {
        console.log('jwt error', error);
        next(error); //to handle the error by globalErrorHandler
    }
});
exports.checkAuth = checkAuth;
