# Dream Tour Management Backend Development – Part 1: Foundational Setup

This is a progress recap of Part 1 of the backend development for the **DreamTourManagement** system. The goal was to set up a clean, scalable, and production-ready Express.js architecture using TypeScript, Zod, and modular patterns.

---

## 🚀 Step-by-Step Implementation Journey

Here’s the logical order in which the backend was built.

---

### ✅ Step 1: Core Application Setup

This step established the basic server infrastructure.

- **Express Server (`app.ts`)**  
  The Express app was initialized with essential middleware:

  - `express.json()` for parsing JSON request bodies
  - `cors()` for enabling cross-origin requests

- **Database Connection (`server.ts`)**  
  Mongoose was configured to connect to MongoDB. The server only starts if the database connection succeeds.

- **Environment Configuration (`app/config/env.ts`)**  
  A type-safe system was created to manage environment variables like `PORT`, `DB_URL`, etc., ensuring better security and easier environment switching (dev, prod).

---

### 👤 Step 2: Building the First Feature Module – User

The user module was used as a pattern for all future modules. This modular architecture helps in scaling and maintaining the app.

- **Interface (`user.interface.ts`)**  
  Defined the `IUser` interface with proper typing for consistent and type-safe data across the app.

- **Model (`user.model.ts`)**  
  Created a Mongoose `userSchema` with field rules like required and unique constraints.

- **Service (`user.service.ts`)**  
  Contains business logic like `User.create()` and `User.find()`. It acts as the “brain” behind each module.

- **Controller (`user.controller.ts`)**  
  Acts as the middle layer between HTTP requests and services. Handles incoming data and formats outgoing responses.

- **Route (`user.route.ts`)**  
  Sets up REST endpoints such as `POST /register` and `GET /all-users` and connects them to controller functions.

---

### 🧱 Step 3: Architecting for Scalability

With the base module built, scalable patterns were introduced.

- **Centralized Routing (`routes/index.ts`)**  
  All module routes are registered in one place. New routes can be added simply by adding them to a `moduleRoutes` array.

- **Standardized Response Utility (`utils/sendResponse.ts`)**  
  A utility to send all success responses in a uniform structure:
  ```ts
  {
    success, statusCode, message, data, meta;
  }
  ```

---

### ⚠️ Step 4: Robust Error Handling System

Handling errors effectively is key to building a stable application.

- **Async Wrapper (`utils/catchAsync.ts`)**
  A higher-order function that wraps async controllers and automatically forwards errors to `next()`. This eliminates repetitive `try...catch` blocks.

- **Custom Error Class (`errorHelpers/appError.ts`)**
  Extends the built-in `Error` class to support custom status codes. Helpful for throwing HTTP-aware errors like `new AppError(404, "User not found")`.

- **Global Error Handler (`middlewares/globalErrorHandler.ts`)**
  Catches and formats all errors into a consistent JSON response.

- **Not Found Handler (`middlewares/notfound.ts`)**
  Captures all undefined routes and sends a clean `404 Not Found` response.

---

### 🔁 Step 5: Server Stability & Graceful Shutdown

In `server.ts`, listeners were added for:

- `unhandledRejection`
- `uncaughtException`
- `SIGTERM`

These allow the server to exit cleanly in case of unexpected errors or shutdown signals — crucial for production readiness.

---

## 🔄 The Complete Request Flow (Example: `POST /api/v1/user/register`)

Let’s break down what happens from request to response.

### 📥 Request Flow:

1. A client sends a `POST` request with user data to `/api/v1/user/register`.

2. `app.ts`:

   - `express.json()` parses the JSON body.
   - The route `/api/v1/user` is forwarded to the router from `routes/index.ts`.

3. `routes/index.ts`:

   - The router matches `/user` and forwards to `userRoutes`.

4. `user.route.ts`:

   - The `POST /register` route is matched.
   - Input validation happens here using `validateRequest` middleware with a Zod schema.

   ```ts
   router.post(
     "/register",
     validateRequest(UserValidations.createUserValidationSchema),
     UserControllers.createUser
   );
   ```

5. `user.controller.ts`:

   - The `createUser` controller is wrapped in `catchAsync`.
   - It receives the validated `req.body`, calls `UserServices.createUser()`, and sends a formatted success response via `sendResponse`.

6. `user.service.ts`:

   - Handles the actual database logic with `User.create()` and returns the new user.

7. `user.model.ts`:

   - Mongoose validates the data and saves it to the MongoDB `users` collection.

---

### ⚠️ Error Flow:

1. If Zod validation fails → `validateRequest` calls `next(error)`.

2. If Mongoose fails (e.g., duplicate email) → the promise rejects.

3. `catchAsync` catches and forwards the error to Express.

4. `globalErrorHandler.ts` receives the error and responds with:

```ts
{
  success: false,
  message: "Detailed error message",
  stack: "only in development"
}
```

---

## 🧠 Summary

In Part 1, the focus was on building a **professional-grade foundation** that supports:

- 🧩 Modular design
- ✅ Consistent responses
- 🧪 Centralized validation and error handling
- 🧱 Scalable route management
- 🧯 Stable production-ready behavior

With this groundwork in place, the application is ready to move on to **authentication, authorization, OTP, and role-based access** in the next part.

---

**Coming up in Part 2**:

- 🔐 Authentication with JWT
- 📨 OTP system
- 🛂 Role-based Access Control (Admin, Guide, User)
- 🧾 Guide approval workflows
