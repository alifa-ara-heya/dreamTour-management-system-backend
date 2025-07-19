# Authentication Flow: Two-Token Strategy

In this application, we employ a **two-token strategy** for authentication to enhance security and user experience. This involves an **Access Token** and a **Refresh Token**.

---

## 📜 Token Overview

### 🔑 Access Token

- A **short-lived JSON Web Token (JWT)** that the client sends with every request to access protected resources.
- Its short lifespan (defined by `JWT_ACCESS_EXPIRES` in `env.ts`) minimizes the risk if it's ever compromised.

### 🔄 Refresh Token

- A **long-lived JWT** used solely to obtain a new access token when the old one expires.
- It is stored securely in an **httpOnly cookie**, making it inaccessible to client-side JavaScript.
- Its longer lifespan is defined by `JWT_REFRESH_EXPIRES`.

---

## 🔥 The Complete Authentication and Refresh Flow

Here is the step-by-step process from initial login to session renewal.

---

### 1️⃣ User Login

- A user submits their credentials (e.g., email/password or through Google OAuth) to a login endpoint like:

  ```
  /api/v1/auth/login
  ```

- The server validates these credentials against the database.

- Upon successful validation, the server generates two tokens:

  - A new **Access Token**, signed with `JWT_ACCESS_SECRET`.
  - A new **Refresh Token**, signed with `JWT_REFRESH_SECRET`.

- The server sends its response:

  - **Access Token** is sent in the JSON body of the response. The frontend stores it (e.g., in memory).
  - **Refresh Token** is sent back in an **httpOnly cookie**. The `cookieParser` middleware in `app.ts` is essential for the server to read this cookie in subsequent requests.

---

### 2️⃣ Accessing Protected Routes

- To make a request to a protected API endpoint (e.g., `/api/v1/bookings`), the frontend client attaches the Access Token to the Authorization header:

  ```plaintext
  Authorization: Bearer <access_token>
  ```

- Backend middleware:

  - Intercepts the request.
  - Verifies the Bearer token's signature and expiration date.
  - If valid, allows the request to proceed to the controller.

---

### 3️⃣ Handling an Expired Access Token

- Eventually, the short-lived Access Token will expire.
- When the client sends a request with the expired token, the backend responds with:

  ```http
  HTTP/1.1 401 Unauthorized
  ```

---

### 4️⃣ The Refresh Token Flow (The Core Logic)

- When the frontend receives a 401 response, it knows to request a new access token.

- It sends a POST request to:

  ```
  /api/v1/auth/refresh-token
  ```

- This request does **not** require an Authorization header. The browser automatically includes the httpOnly cookie containing the Refresh Token.

**Backend process:**

- Uses `cookieParser` to extract the refresh token from cookies.
- Verifies the refresh token:

  - Checks signature with `JWT_REFRESH_SECRET`.
  - Checks expiration.
  - Optionally confirms the user still exists and is active in the database.

- If valid:

  - Generates a new Access Token (signed with `JWT_ACCESS_SECRET`).
  - Sends it back in the JSON response body.

---

### 5️⃣ Resuming the Session

- The frontend receives the new Access Token.
- It updates its stored Access Token.
- Automatically retries the original failed API request, now with a valid token.
- The user’s session continues seamlessly.

---

### 6️⃣ When the Refresh Token Expires

- If the Refresh Token is expired or invalid, the backend responds with:

  ```http
  HTTP/1.1 403 Forbidden
  ```

- The client knows the session is over.

- Clears user state and redirects to the login page for re-authentication.

---

## ⚙️ Configuration References

- **Access Token Expiration:** `JWT_ACCESS_EXPIRES` in `env.ts`
- **Refresh Token Expiration:** `JWT_REFRESH_EXPIRES` in `env.ts`
- **Secrets:** `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- **Middleware:** `cookieParser` in `app.ts`

---

This entire process provides a secure and smooth authentication experience for the end-user.
