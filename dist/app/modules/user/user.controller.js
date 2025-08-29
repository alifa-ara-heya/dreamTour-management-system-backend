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
exports.UserControllers = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_service_1 = require("./user.service");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
/* type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>

const catchAsync = (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err: any) => {
        console.log(err);
        next(err)
    })
} */
/* const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //  const { name, email } = req.body;
        // const user = await User.create({
        //     name,
        //     email
        // })  //controller should not handle this business logic, move to service.ts
        // throw new AppError(httpStatus.BAD_REQUEST, 'fake error')

        const user = await UserServices.createUser(req.body)

        res.status(httpStatus.CREATED).json({
            message: 'User created successfully!',
            user
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.log(error);
        //  res.status(httpStatus.BAD_REQUEST).json({
        //     message: `Something went wrong! The error is ${error.message}`,
        //     error
        // }
        next(error) //global error handler
    }
} */
const createUser = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_service_1.UserServices.createUser(req.body);
    /*  res.status(httpStatus.CREATED).json({
         message: "User created successfully",
         user
     }) */
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "User created successfully",
        data: user
    });
}));
// getting all users
/* const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await UserServices.getAllUsers()

        res.status(httpStatus.OK).json({
            message: 'Users retrieved successfully',
            users
        })
    } catch (error) {
        next(error)
    }
} */
const getAllUsers = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield user_service_1.UserServices.getAllUsers(query);
    /* res.status(httpStatus.OK).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users
    }) */
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "All Users retrieved successfully",
        data: result.data,
        meta: result.meta
    });
}));
// updating users
const updateUser = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    // const token = req.headers.authorization;
    // const verifiedToken = verifyToken(token as string, envVars.JWT_ACCESS_SECRET) as JwtPayload;
    const verifiedToken = req.user; ////we declared a global type for it in app> interface> index.d.ts
    const payload = req.body;
    const user = yield user_service_1.UserServices.updateUser(userId, payload, verifiedToken);
    /*  res.status(httpStatus.CREATED).json({
         message: "User created successfully",
         user
     }) */
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "User updated successfully",
        data: user
    });
}));
const getMe = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedToken = req.user;
    const result = yield user_service_1.UserServices.getMe(decodedToken.userId);
    // res.status(httpStatus.OK).json({
    //     success: true,
    //     message: "All Users Retrieved Successfully",
    //     data: users
    // })
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Your profile Retrieved Successfully",
        data: result.data
    });
}));
const getSingleUser = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield user_service_1.UserServices.getSingleUser(id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "User Retrieved Successfully",
        data: result.data
    });
}));
exports.UserControllers = {
    createUser,
    getAllUsers,
    updateUser,
    getMe,
    getSingleUser
};
// route matching -> controller -> service -> model -> db
// 1st create model, then service, then use that function in controller, the use the controller in route
