"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsync = void 0;
const env_1 = require("../config/env");
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
        if (env_1.envVars.NODE_ENV === 'development') {
            console.log(err);
        }
        next(err);
    });
};
exports.catchAsync = catchAsync;
/* export const catchAsync = (fn: RequestHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch((err) => next(err));
    };
};
 */
// We can make one small improvement by using the built-in RequestHandler type from Express, which makes your custom AsyncHandler type unnecessary. 
