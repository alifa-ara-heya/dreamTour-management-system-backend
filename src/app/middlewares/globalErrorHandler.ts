import { NextFunction, Request, Response } from "express"
import { envVars } from "../config/env"
import AppError from "../errorHelpers/AppError"
// import { ZodError } from 'zod';
// import httpStatus from 'http-status-codes';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction) => { // You must keep next in the parameter list for Express to recognize it as your global error handler, even if you don't use it.
  let statusCode = 500
  let message = `Something went wrong!`

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message
  } else if (err instanceof Error) {
    statusCode = 500;
    message = err.message
  }

  res.status(statusCode).json({
    success: false,
    message,
    err,
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