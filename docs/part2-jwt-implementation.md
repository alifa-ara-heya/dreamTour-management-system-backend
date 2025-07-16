# JWT Implementation Walkthrough

Let’s walk through the JWT process I’ve implemented in my application, how the flow works.

---

## 📝 A Quick Refresher on JWTs

A **JSON Web Token (JWT)** is a standard I’m using to securely transmit information between my client and server. It’s essentially a signed, self-contained JSON object.

Because it’s signed with a secret key that only my server knows, I can trust the information within it.

### 📦 JWT Structure

It has three parts:

1. **Header**
   Metadata about the token (e.g., algorithm `HS256`).
2. **Payload**
   The data I want to send (claims), like `userId`, `email`, and `role`, plus standard claims like `exp` (expiration time).
3. **Signature**
   Ensures the token’s integrity. Created using the header, payload, and my secret key.

---

## 🚀 The JWT Flow I’ve Built

Here is the step-by-step flow of how I am using JWTs in my code.

---

### ✅ Step 1: Generate Token on Login

This is where my user gets their credentials for accessing protected parts of the API.

1. **Login Request**
   A user submits their email and password to my `/api/v1/auth/login` endpoint.

2. **Service Logic (`auth.service.ts`)**

   - `credentialsLogin` service finds the user in the database.
   - Securely compares the submitted password with the stored hash using `bcryptjs.compare`.
   - Creates a `jwtPayload` object with only necessary, non-sensitive data.

```ts
const jwtPayload = {
  userId: isUserExist._id,
  email: isUserExist.email,
  role: isUserExist.role,
};
```

3. **Signing the Token (`utils/jwt.ts`)**

   - I call my generateToken utility. It's great that I've abstracted this into a separate utility file to keep my code clean.

   - Uses `jsonwebtoken` to sign the payload with `JWT_ACCESS_SECRET` and sets an expiration time from my `.env` variables..

4. **Sending the Token**

   - Sends the newly created `accessToken` back to the client. The client stores it for future requests.

---

### 🔐 Step 2: Client Accesses a Protected Route

Now, the user wants to do something that requires authentication, like updating their profile.

1. The client sends a PATCH request to `/api/v1/user/:id` with the `accessToken` in the Authorization header, typically as `Bearer <token>`.:

2. **Middleware Intercepts (`user.route.ts`)**

   - The request passes through the `checkAuth` middleware before hitting the controller.

---

### 🛡 Step 3: Verify the Token and Authorize the User (`checkAuth.ts`)

This middleware is the heart of the API’s security.

- **A Flexible Higher-Order Function**
  I designed `checkAuth` as a higher-order function. It accepts a list of roles (`...authRoles`) and returns an Express middleware function. This makes it incredibly powerful and reusable. For instance, to protect an admin-only route, I simply use `checkAuth(Role.ADMIN, Role.SUPER_ADMIN)`.

- **Token Extraction**
  My middleware first looks for the Authorization header and extracts the token.

- **Token Verification**
  It then calls my `verifyToken` utility function.
  This function uses `jwt.verify()` with the same `JWT_ACCESS_SECRET`. This single call verifies both the signature (ensuring it’s not tampered with) and the expiration date.
  If the token is invalid for any reason, `jwt.verify()` throws an error, which my catch block sends to my `globalErrorHandler`.

- **Role-Based Authorization**
  If the token is valid, I then check if the user’s role (from the decoded token) is included in the `authRoles` I passed to the middleware. If not, I throw a "Forbidden" error.

- **Attaching the User to the Request**
  This is a key pattern I’ve implemented. After successful verification and authorization, I attach the entire decoded payload to the Express `Request` object.

```ts
req.user = verifiedToken; // declared globally in src/app/interfaces/index.d.ts
```

---

### 🏗 Step 4: Controller and Service Use Authenticated User

Because of the work I did in the middleware, my controller logic is now much cleaner.

- **Accessing the User in the Controller (`user.controller.ts`)**
  In my updateUser controller, I can now trust that req.user exists and contains the authenticated user's data. I don't need to re-verify the token here.

```ts
const verifiedToken = req.user;

This is fully type-safe because I cleverly extended the global Express Request type in backend-tour-managemnet-system\src\app\interfaces\index.d.ts.

```

- **Service-Layer Logic (`user.service.ts`)**
  I pass this trusted `verifiedToken` to my service layer, where I can implement fine-grained business logic, such as checking if an `ADMIN` is trying to modify a SUPER_ADMIN.

This entire flow is **robust** and **secure**.
