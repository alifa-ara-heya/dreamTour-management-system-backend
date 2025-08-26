import { NextFunction, Request, Response } from "express"
import { envVars } from "../config/env"
import AppError from "../errorHelpers/AppError"
import { TErrorSources } from "../interfaces/error.types";
import { handlerDuplicateError } from "../errorHelpers/handleDuplicateError";
import { handleCastError } from "../errorHelpers/handleCastError";
import { handlerZodError } from "../errorHelpers/handleZodError";
import { handlerValidationError } from "../errorHelpers/handleValidationError";
import { deleteImageFromCLoudinary } from "../config/cloudinary.config";
// import { ZodError } from 'zod';
// import httpStatus from 'http-status-codes';

export const globalErrorHandler = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction) => { // You must keep next in the parameter list for Express to recognize it as your global error handler, even if you don't use it.

  if (envVars.NODE_ENV === "development") {
    console.log(err);
  }

  console.log({ file: req.files });
  if (req.file) {
    await deleteImageFromCLoudinary(req.file.path)
  }

  if (req.files && Array.isArray(req.files) && req.files.length) {
    const imageUrls = (req.files as Express.Multer.File[]).map(file => file.path)

    await Promise.all(imageUrls.map(url => deleteImageFromCLoudinary(url)))
  }

  let errorSources: TErrorSources[] = [/* {
      path: "isDeleted",
      message: "Cast Failed"
    } */]
  let statusCode = 500
  let message = `Something went wrong!`

  // duplicate error
  if (err.code === 11000) {
    const simplifiedError = handlerDuplicateError(err)
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message
  }

  // cast error/ object id error
  else if (err.name === "CastError") {
    const simplifiedError = handleCastError(err)
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message
  }

  // zod error
  else if (err.name === "ZodError") {
    const simplifiedError = handlerZodError(err)
    statusCode = simplifiedError.statusCode
    message = simplifiedError.message
    errorSources = simplifiedError.errorSources as TErrorSources[]
  }

  // Mongoose validation error
  else if (err.name === "ValidationError") {
    const simplifiedError = handlerValidationError(err)
    statusCode = simplifiedError.statusCode;
    errorSources = simplifiedError.errorSources as TErrorSources[]
    message = simplifiedError.message
  }

  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message
  } else if (err instanceof Error) {
    statusCode = 500;
    message = err.message
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err: envVars.NODE_ENV === "development" ? err : null,
    stack:
      envVars.NODE_ENV === 'development'
        ? err.stack
        : null //helps finding from which file the error is coming, but only for development, not for production
  })
}


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