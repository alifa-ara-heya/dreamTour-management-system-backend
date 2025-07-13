import { Router } from "express";
import { UserControllers } from "./user.controller";
import { createUserZodSchema } from "./user.validation";
import { validateRequest } from "../../../middlewares/validateRequest";


const router = Router();

// router.post("/register", UserControllers.createUser)
//we want to validate and sanitize when registering someone

router.post("/register",
    // checking input
    /*  req.body = await createUserZodSchema.parseAsync(req.body)
     console.log(req.body); */
    //pass it to controller
    // next()
    validateRequest(createUserZodSchema),
    UserControllers.createUser)

router.get('/all-users', UserControllers.getAllUsers)

export const userRoutes = router;