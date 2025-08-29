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
exports.globalErrorHandler = void 0;
const env_1 = require("../config/env");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const handleDuplicateError_1 = require("../errorHelpers/handleDuplicateError");
const handleCastError_1 = require("../errorHelpers/handleCastError");
const handleZodError_1 = require("../errorHelpers/handleZodError");
const handleValidationError_1 = require("../errorHelpers/handleValidationError");
const cloudinary_config_1 = require("../config/cloudinary.config");
// import { ZodError } from 'zod';
// import httpStatus from 'http-status-codes';
const globalErrorHandler = (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) => __awaiter(void 0, void 0, void 0, function* () {
    if (env_1.envVars.NODE_ENV === "development") {
        console.log(err);
    }
    console.log({ file: req.files });
    if (req.file) {
        yield (0, cloudinary_config_1.deleteImageFromCLoudinary)(req.file.path);
    }
    if (req.files && Array.isArray(req.files) && req.files.length) {
        const imageUrls = req.files.map(file => file.path);
        yield Promise.all(imageUrls.map(url => (0, cloudinary_config_1.deleteImageFromCLoudinary)(url)));
    }
    let errorSources = [ /* {
        path: "isDeleted",
        message: "Cast Failed"
      } */];
    let statusCode = 500;
    let message = `Something went wrong!`;
    // duplicate error
    if (err.code === 11000) {
        const simplifiedError = (0, handleDuplicateError_1.handlerDuplicateError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    // cast error/ object id error
    else if (err.name === "CastError") {
        const simplifiedError = (0, handleCastError_1.handleCastError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    // zod error
    else if (err.name === "ZodError") {
        const simplifiedError = (0, handleZodError_1.handlerZodError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources;
    }
    // Mongoose validation error
    else if (err.name === "ValidationError") {
        const simplifiedError = (0, handleValidationError_1.handlerValidationError)(err);
        statusCode = simplifiedError.statusCode;
        errorSources = simplifiedError.errorSources;
        message = simplifiedError.message;
    }
    else if (err instanceof AppError_1.default) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err instanceof Error) {
        statusCode = 500;
        message = err.message;
    }
    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        err: env_1.envVars.NODE_ENV === "development" ? err : null,
        stack: env_1.envVars.NODE_ENV === 'development'
            ? err.stack
            : null //helps finding from which file the error is coming, but only for development, not for production
    });
});
exports.globalErrorHandler = globalErrorHandler;
/* better error handler

export const globalErrorHandler = (
  // It's common to type `err` as `any` here because anything can be thrown.
  // We'll check its type inside the function.
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Something went wrong!';
  let errorMessage = '';

  // Handle Zod validation errors specifically
  if (err instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = 'Validation Error';
    // Join all Zod issues into a single message string
    errorMessage = err.issues
      .map((issue) => `${issue.path.join('.')} is ${issue.message}`)
      .join('. ');
  }
  // Handle Mongoose Validation Error
  else if (err.name === 'ValidationError') {
    statusCode = httpStatus.BAD_REQUEST;
    message = 'Validation Error';
    errorMessage = Object.values(err.errors)
      .map((val: any) => val.message)
      .join('. ');
  }
  // Handle Mongoose Cast Error (e.g., invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = httpStatus.BAD_REQUEST;
    message = 'Invalid ID';
    errorMessage = `${err.value} is not a valid ID!`;
  }
  // Handle Mongoose Duplicate Key Error
  else if (err.code === 11000) {
    statusCode = httpStatus.CONFLICT;
    message = 'Duplicate Entry';
    const match = err.message.match(/"([^"]*)"/);
    const extractedMessage = match && match[1];
    errorMessage = `Duplicate value entered for field: ${extractedMessage}. Please use another value.`;
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorMessage,
    errorDetails: err,
    stack: envVars.NODE_ENV === 'development' ? err.stack : null,
  });
};*/ 
