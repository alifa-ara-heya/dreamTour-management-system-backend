## **📌 Task Overview: Guide Application Module**

You are now part of the backend development team working on enhancing the **Tour Management System (TMS)**. Your task is to implement a fully functional **Guide Application Module**, allowing users to apply as travel guides and enabling admins to approve or reject these applications.

This module must follow the existing architectural patterns, maintain code consistency, and be well-documented for future maintenance and scalability.

## **✅ Module Objectives**

* Allow authenticated users to apply as a guide by uploading their NID and selecting a division.

* Enable admins to approve or reject guide applications.

* Provide a filtered and paginated list of all guide applications.

## **🔧 API Requirements**

### **1\. `POST /guide/apply`**

* **Access**: Authenticated users only (Role: `USER`)

* **Description**: Allows users to apply for guide status.

* **Features**:

  * Accepts a file upload (NID photo).

  * Requires `divisionId` in the request body.

  * Validates the request using Zod schema.

  * Prevents duplicate applications by the same user.

* **Response**: Success message with created application data.

### **2\. `POST /guide/approve/:id`**

* **Access**: Admins only (Role: `ADMIN` / `SUPER_ADMIN`)

* **Description**: Approves or rejects a pending guide application.

* **Features**:

  * Accepts `status` in request body (`APPROVED` or `REJECTED`).

  * Updates application status and user role accordingly.

  * Prevents invalid state transitions (e.g., rejecting an approved application).

* **Response**: Updated application data.

### **3\. `GET /guide`**

* **Access**: Admins only (Role: `ADMIN` / `SUPER_ADMIN`)

* **Description**: Fetches all guide applications with filters and pagination.

* **Query Filters**:

  * `status` (optional): Filter by status.

  * `searchTerm` (optional): Matches user name/email or division name.

  * `division`, `user`: Filter by specific user or division.

  * `page`, `limit`: For pagination.

* **Response**: Paginated list with meta data.

## **🧾 Model Definition**

**GuideApplication Schema**

user: ObjectId (ref: "User", required, unique)

nidPhoto: string (required)

division: ObjectId (ref: "Division", required)

status: enum("PENDING", "APPROVED", "REJECTED") default: "PENDING"

## **🧪 Validation**

**Zod Schema:**

divisionId: z.string()

## **📂 File Structure & Standards**

You should follow the modular structure used in the existing codebase:

/modules/guide

├── guide.controller.ts

├── guide.routes.ts

├── guide.service.ts

├── guide.model.ts

├── guide.validation.ts

* Use the `catchAsync` and `sendResponse` utilities provided.

* Protect routes using `auth(...)` middleware.

* File uploads must use the provided `fileUploader` helper.

* Ensure atomic operations using Mongoose transactions where applicable.

## **📌 Expectations**

* Follow the **DRY** and **SOLID** principles.

* Maintain naming conventions and folder structure.

* Implement meaningful error messages and handle edge cases.

* Include basic inline documentation in controllers and services.

## **🎯 Bonus (Optional for Advanced Students)**

* Add an endpoint: `GET /guide/:id` to get details of a single guide application.

* Add soft delete functionality or an "ARCHIVED" status.

