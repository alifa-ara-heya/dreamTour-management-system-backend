# Google Authentication Setup: A Step-by-Step Guide

This guide outlines the process of implementing a "Login with Google" feature in a Node.js/Express application using Passport.js.

## Step 1: Setting Up the Foundation with Middleware

The foundation is established in the main `app.ts` file by configuring the necessary middleware for Passport to function correctly.

```ts
// d:\L2-programming-hero\backend-tour-management-system\src\app.ts

import express from "express";
import cors from "cors";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notfound";
import cookieParser from "cookie-parser";
import passport from "passport";
import expressSession from "express-session";
// import passport config
import "./app/config/passport";
import { envVars } from "./app/config/env";

const app = express();

// Configure express-session for Passport
app.use(
  expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport and its session handling
app.use(passport.initialize());
app.use(passport.session());

app.use(cookieParser());
// ... other middleware and routes
```

- **Express Session**: The `express-session` middleware is added. Passport uses this to maintain a login session for the user during the OAuth handshake with Google. It is secured with a secret sourced from environment variables.
- **Passport Initialization**: Passport is initialized with `passport.initialize()` and its session handling is enabled with `passport.session()`. This hooks Passport into the Express request-response cycle.
- **Passport Configuration**: The line `import "./app/config/passport"` is a crucial step. This imported file contains the core Passport strategy configuration. Within this configuration, the `GoogleStrategy` is defined, the Google Client ID and Secret are provided, and the verify callback function is implemented. This function is responsible for finding or creating a user in the database based on the profile information returned by Google.
- **Cookie Parser**: `cookie-parser` is included to facilitate setting custom JSON Web Tokens (JWTs) in browser cookies after a successful login.

## Step 2: Creating the "Login with Google" Route

In `auth.route.ts`, an endpoint is defined for initiating the Google login process from the frontend.

```ts
// d:\L2-programming-hero\backend-tour-management-system\src\app\modules\auth\auth.route.ts

router.get(
  "/google",
  async (req: Request, res: Response, next: NextFunction) => {
    const redirect = req.query.redirect || "/";
    passport.authenticate("google", {
      scope: ["profile", "email"],
      state: redirect as string,
    })(req, res, next);
  }
);
```

- When a request is made to `/api/v1/auth/google`, the `passport.authenticate('google', ...)` middleware is triggered.

- **`scope`**: The scope is set to `["profile", "email"]`. This informs Google that the application is requesting permission to access the user's basic profile information (like name and picture) and their email address.
- **`state`**: This option provides an enhanced user experience. A `redirect` query parameter from the frontend can be captured and passed as the `state`. This allows the frontend to specify where the user should be redirected after a successful login (e.g., `/my-tours`). Google includes this `state` value in the callback request.

This route redirects the user from the application to Google's standard login page.

## Step 3: Handling the Callback from Google

After the user authenticates with Google and grants permission, Google redirects them back to a predefined callback URL. A route is defined to handle this callback.

```typescript
// d:\L2-programming-hero\backend-tour-management-system\src\app\modules\auth\auth.route.ts

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }), // Handle failed authentication
  AuthControllers.googleCallbackController // Handle successful authentication
);
```

This route, `/api/v1/auth/google/callback`, is protected by the same `passport.authenticate('google', ...)` middleware. In this context, Passport's role is to:

1.  Take the authorization code from Google's response.
2.  Exchange it for an access token and user profile information behind the scenes.
3.  Invoke the verify function defined in the `passport.ts` configuration.

- If the authentication fails (e.g., the user denies access), the `failureRedirect: "/login"` option sends the user back to a login page on the frontend.
- Upon success, Passport attaches the user object (retrieved from the database) to `req.user` and passes control to the `googleCallbackController`.

## Step 4: Finalizing Login and Redirecting the User

The final step occurs in `auth.controller.ts`, where the authenticated user from Passport is processed, an application-specific session is created, and the user is redirected back to the frontend.

```typescript
// d:\L2-programming-hero\backend-tour-management-system\src\app\modules\auth\auth.controller.ts

const googleCallbackController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Retrieve the original redirect path from the state query parameter
    let redirectTo = req.query.state ? (req.query.state as string) : "";

    if (redirectTo.startsWith("/")) {
      redirectTo = redirectTo.slice(1);
    }

    // Get the user object attached by Passport
    const user = req.user;

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
    }

    // Create application-specific JWTs
    const tokenInfo = createUserTokens(user);

    // Set JWTs as secure, httpOnly cookies
    setAuthCookie(res, tokenInfo);

    // Redirect the user back to the frontend
    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`);
  }
);
```

1.  **Get User and Redirect Path**: The user object is retrieved from `req.user`, and the original redirect path is extracted from `req.query.state`.
2.  **Create JWTs**: The `createUserTokens(user)` utility is called. This represents a key transition from Google's OAuth flow to the application's own JWT-based authentication system. This function generates a custom `accessToken` and `refreshToken`.
3.  **Set Secure Cookies**: The `setAuthCookie(res, tokenInfo)` utility is used to securely set the `accessToken` and `refreshToken` as `httpOnly` cookies in the user's browser.
4.  **Redirect to Frontend**: Finally, the user is redirected back to the frontend application, completing the login flow. For example, if the original path was `/my-tours`, the user would be sent to `https://my-frontend-app.com/my-tours`.

At this point, the user is successfully logged in, and the frontend can use the tokens (stored in cookies) to make authenticated API requests.
