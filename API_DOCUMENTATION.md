# Hireflow API Documentation

## API Response Structure

All API responses in Hireflow follow a consistent structure defined below:

### Standard Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {} // Optional - depends on the endpoint
}
```

### Standard Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates whether the request was successful |
| `message` | string | A descriptive message about the operation |
| `data` | object/null | The actual data returned by the endpoint (only present when applicable) |

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful request |
| 201 | Created | Resource successfully created |
| 400 | Bad Request | Validation failed or invalid input |
| 401 | Unauthorized | Authentication failed |
| 403 | Forbidden | Email not verified or insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource (e.g., email already exists) |
| 500 | Internal Server Error | Unexpected server error |

---

## Authentication Endpoints

### Base URL
```
/api/v1/auth
```

### Roles
- `APPLICANT` - Job applicant
- `HMANAGER` - HR Manager
- `ADMIN` - Administrator

---

### 1. Register User

**Endpoint:** `POST /api/v1/auth/register`

**Status Code:** 201 Created

**Description:** Register a new user account. An OTP will be sent to the user's email for verification.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "user@example.com",
  "password": "string",
  "role": "APPLICANT" // or "HMANAGER" or "ADMIN"
}
```

**Request Validations:**
- `firstName`: Required, non-empty
- `lastName`: Required, non-empty
- `email`: Required, valid email format
- `password`: Required, minimum 8 characters
- `role`: Required, one of (APPLICANT, HMANAGER, ADMIN)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Check your email for the OTP"
}
```

**Error Responses:**

**409 Conflict - Email Already Exists:**
```json
{
  "success": false,
  "message": "An account with this email already exists"
}
```

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "message": "First name is required, Email is required, Password must be at least 8 characters"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "User registration failed: Internal Server Error"
}
```

---

### 2. Verify OTP

**Endpoint:** `POST /api/v1/auth/verify-otp`

**Status Code:** 200 OK

**Description:** Verify the OTP sent to the user's email to complete email verification.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Request Validations:**
- `email`: Required, valid email format
- `otp`: Required, non-empty

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Error Responses:**

**404 Not Found - User Not Found:**
```json
{
  "success": false,
  "message": "User not found"
}
```

**400 Bad Request - Invalid OTP:**
```json
{
  "success": false,
  "message": "Invalid OTP"
}
```

**400 Bad Request - OTP Expired:**
```json
{
  "success": false,
  "message": "OTP has expired. Please request a new one"
}
```

**400 Bad Request - Already Verified:**
```json
{
  "success": false,
  "message": "Account is already verified"
}
```

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "message": "Email is required, OTP is required"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "OTP verification failed: Internal Server Error"
}
```

---

### 3. Login

**Endpoint:** `POST /api/v1/auth/login`

**Status Code:** 200 OK

**Description:** Login a user with email and password. Returns a JWT token if email is verified.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Request Validations:**
- `email`: Required, valid email format
- `password`: Required, non-empty

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "APPLICANT"
  }
}
```

**Response Data Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `token` | string | JWT token for authenticating subsequent requests |
| `userId` | string | UUID of the authenticated user |
| `email` | string | Email of the user |
| `role` | string | User role (APPLICANT, HMANAGER, ADMIN) |

**Error Responses:**

**400 Bad Request - Invalid Credentials:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**403 Forbidden - Email Not Verified:**
```json
{
  "success": false,
  "message": "Please verify your email. Enter the OTP sent to your inbox."
}
```

**403 Forbidden - OTP Expired (will send new OTP):**
```json
{
  "success": false,
  "message": "Please verify your email. A new OTP has been sent to your email."
}
```

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "message": "Email is required, Password is required"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Login failed: Internal Server Error"
}
```

---

## Important Notes

### JWT Token Usage

After successful login, include the JWT token in the Authorization header for authenticated requests:

```
Authorization: Bearer <token_from_login_response>
```

### OTP Expiration

- OTP is valid for **600 seconds (10 minutes)** from time of generation
- If OTP is incorrect during verification, only 1 attempt is allowed
- A new OTP can be requested during login attempt if the previous one has expired

### Password Requirements

- Minimum length: **8 characters**

### Email Verification

- Email verification is **mandatory** before login
- Users cannot login without email verification
- If OTP expires before verification, a new one is automatically sent on next login attempt

---

---

## Companies Endpoints

### Base URL
```
/api/v1/companies
```

**Authentication:** Required (JWT Token)

---

### 1. Create Company

**Endpoint:** `POST /api/v1/companies`

**Status Code:** 201 Created

**Description:** Create a new company profile.

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Tech Corp",
  "industry": "Information Technology",
  "website": "https://techcorp.com",
  "logoUrl": "https://example.com/logo.png",
  "companySize": "500-1000"
}
```

**Request Validations:**
- `name`: Required, non-empty, max 150 characters
- `industry`: Optional string
- `website`: Optional string (URL format expected)
- `logoUrl`: Optional string (URL format expected)
- `companySize`: Optional string

**Success Response (201):**
```json
{
  "success": true,
  "message": "Company created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Tech Corp",
    "industry": "Information Technology",
    "website": "https://techcorp.com",
    "logoUrl": "https://example.com/logo.png",
    "companySize": "500-1000"
  }
}
```

**Error Responses:**

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "message": "Name is required, Name must be at most 150 characters"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Invalid or missing JWT token"
}
```

---

### 2. Update Company

**Endpoint:** `PUT /api/v1/companies/{id}`

**Status Code:** 200 OK

**Description:** Update an existing company profile.

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Company UUID |

**Request Body:**
```json
{
  "name": "Tech Corp Updated",
  "industry": "Information Technology",
  "website": "https://techcorp.com",
  "logoUrl": "https://example.com/logo-new.png",
  "companySize": "1000-5000"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Company updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Tech Corp Updated",
    "industry": "Information Technology",
    "website": "https://techcorp.com",
    "logoUrl": "https://example.com/logo-new.png",
    "companySize": "1000-5000"
  }
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "success": false,
  "message": "Company not found"
}
```

**403 Forbidden - Insufficient Permissions:**
```json
{
  "success": false,
  "message": "You don't have permission to update this company"
}
```

---

### 3. Get Company by ID

**Endpoint:** `GET /api/v1/companies/{id}`

**Status Code:** 200 OK

**Description:** Retrieve a specific company by ID.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Company UUID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Company retrieved",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Tech Corp",
    "industry": "Information Technology",
    "website": "https://techcorp.com",
    "logoUrl": "https://example.com/logo.png",
    "companySize": "500-1000"
  }
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "success": false,
  "message": "Company not found"
}
```

---

### 4. Get My Company

**Endpoint:** `GET /api/v1/companies/me`

**Status Code:** 200 OK

**Description:** Retrieve the company details of the currently authenticated user. Only accessible by users with ADMIN or HMANAGER roles.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Company retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Tech Corp",
    "industry": "Information Technology",
    "website": "https://techcorp.com",
    "logoUrl": "https://example.com/logo.png",
    "companySize": "500-1000"
  }
}
```

**Error Responses:**

**403 Forbidden - Insufficient Permissions:**
```json
{
  "success": false,
  "message": "Only admins or hiring managers can perform this action"
}
```

**404 Not Found - No Company Associated:**
```json
{
  "success": false,
  "message": "Company not found for the user"
}
```

---

### 5. List All Companies (Paginated)

**Endpoint:** `GET /api/v1/companies`

**Status Code:** 200 OK

**Description:** Retrieve all companies with pagination support.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 0 | Zero-based page number |
| `size` | integer | 10 | Number of items per page |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Companies retrieved",
  "data": {
    "content": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Tech Corp",
        "industry": "Information Technology",
        "website": "https://techcorp.com",
        "logoUrl": "https://example.com/logo.png",
        "companySize": "500-1000"
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10,
      "totalElements": 50,
      "totalPages": 5
    }
  }
}
```

---

### 6. Delete Company

**Endpoint:** `DELETE /api/v1/companies/{id}`

**Status Code:** 200 OK

**Description:** Delete a company profile. Only the company owner can delete.

**Request Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Company UUID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Company deleted successfully"
}
```

**Error Responses:**

**403 Forbidden - Insufficient Permissions:**
```json
{
  "success": false,
  "message": "You don't have permission to delete this company"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Company not found"
}
```

---

## Job Listings Endpoints

### Base URL
```
/api/v1/jobs
```

**Authentication:** Required for POST, PUT, DELETE (JWT Token)

### Job Type Enum
- `FULL_TIME`
- `PART_TIME`
- `CONTRACT`
- `INTERNSHIP`
- `REMOTE`

### Job Status Enum
- `DRAFT`
- `OPEN`
- `PAUSED`
- `CLOSED`
- `FILLED`

---

### 1. Create Job Listing

**Endpoint:** `POST /api/v1/jobs`

**Status Code:** 201 Created

**Description:** Create a new job listing for a company.

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Senior Software Engineer",
  "type": "FULL_TIME",
  "location": "San Francisco, CA",
  "summary": "We are looking for an experienced Senior Software Engineer...",
  "responsibilities": "Design and implement scalable solutions...",
  "requiredQualifications": "5+ years of experience in software development...",
  "preferredQualifications": "Experience with cloud technologies...",
  "status": "OPEN",
  "autoRejectThreshold": 30,
  "autoPassThreshold": 85,
  "skillIds": ["skill-id-1", "skill-id-2"]
}
```

**Request Validations:**
- `title`: Required, max 200 characters
- `type`: Required, one of (FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, REMOTE)
- `location`: Optional, max 200 characters
- `summary`: Required, max 5000 characters
- `responsibilities`: Required, non-empty
- `requiredQualifications`: Required, non-empty
- `preferredQualifications`: Optional
- `status`: Optional, defaults to DRAFT
- `autoRejectThreshold`: Required, integer 0-100
- `autoPassThreshold`: Required, integer 0-100
- `skillIds`: Optional, array of skill UUIDs

**Success Response (201):**
```json
{
  "success": true,
  "message": "Job listing created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Senior Software Engineer",
    "type": "FULL_TIME",
    "location": "San Francisco, CA",
    "summary": "We are looking for an experienced Senior Software Engineer...",
    "responsibilities": "Design and implement scalable solutions...",
    "requiredQualifications": "5+ years of experience in software development...",
    "preferredQualifications": "Experience with cloud technologies...",
    "status": "OPEN",
    "autoRejectThreshold": 30,
    "autoPassThreshold": 85,
    "companyId": "550e8400-e29b-41d4-a716-446655440000",
    "companyName": "Tech Corp",
    "skills": [
      {"id": "skill-id-1", "name": "Java"},
      {"id": "skill-id-2", "name": "Spring Boot"}
    ]
  }
}
```

**Error Responses:**

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "message": "Title is required, Auto-reject threshold must be between 0 and 100"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Invalid or missing JWT token"
}
```

---

### 2. Update Job Listing

**Endpoint:** `PUT /api/v1/jobs/{id}`

**Status Code:** 200 OK

**Description:** Update an existing job listing.

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Job Listing UUID |

**Request Body:**
```json
{
  "title": "Senior Software Engineer (Updated)",
  "type": "FULL_TIME",
  "location": "San Francisco, CA",
  "summary": "Updated summary...",
  "responsibilities": "Updated responsibilities...",
  "requiredQualifications": "Updated qualifications...",
  "preferredQualifications": "Updated preferred qualifications...",
  "status": "OPEN",
  "autoRejectThreshold": 35,
  "autoPassThreshold": 80,
  "skillIds": ["skill-id-1", "skill-id-2", "skill-id-3"]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job listing updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Senior Software Engineer (Updated)",
    "type": "FULL_TIME",
    "location": "San Francisco, CA",
    "summary": "Updated summary...",
    "responsibilities": "Updated responsibilities...",
    "requiredQualifications": "Updated qualifications...",
    "preferredQualifications": "Updated preferred qualifications...",
    "status": "OPEN",
    "autoRejectThreshold": 35,
    "autoPassThreshold": 80,
    "companyId": "550e8400-e29b-41d4-a716-446655440000",
    "companyName": "Tech Corp",
    "skills": [
      {"id": "skill-id-1", "name": "Java"},
      {"id": "skill-id-2", "name": "Spring Boot"},
      {"id": "skill-id-3", "name": "Docker"}
    ]
  }
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "success": false,
  "message": "Job listing not found"
}
```

**403 Forbidden - Insufficient Permissions:**
```json
{
  "success": false,
  "message": "You don't have permission to update this job listing"
}
```

---

### 3. Get Job Listing by ID

**Endpoint:** `GET /api/v1/jobs/{id}`

**Status Code:** 200 OK

**Description:** Retrieve a specific job listing by ID.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Job Listing UUID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job listing retrieved",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Senior Software Engineer",
    "type": "FULL_TIME",
    "location": "San Francisco, CA",
    "summary": "We are looking for an experienced Senior Software Engineer...",
    "responsibilities": "Design and implement scalable solutions...",
    "requiredQualifications": "5+ years of experience in software development...",
    "preferredQualifications": "Experience with cloud technologies...",
    "status": "OPEN",
    "autoRejectThreshold": 30,
    "autoPassThreshold": 85,
    "companyId": "550e8400-e29b-41d4-a716-446655440000",
    "companyName": "Tech Corp",
    "skills": [
      {"id": "skill-id-1", "name": "Java"},
      {"id": "skill-id-2", "name": "Spring Boot"}
    ]
  }
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "success": false,
  "message": "Job listing not found"
}
```

---

### 4. Get Job Listings by Company

**Endpoint:** `GET /api/v1/jobs/company/{companyId}`

**Status Code:** 200 OK

**Description:** Retrieve all job listings for a specific company with optional filtering by status.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `companyId` | string | Yes | Company UUID |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | null | Filter by job status (DRAFT, OPEN, PAUSED, CLOSED, FILLED) |
| `page` | integer | 0 | Zero-based page number |
| `size` | integer | 10 | Number of items per page |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job listings retrieved",
  "data": {
    "content": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "title": "Senior Software Engineer",
        "type": "FULL_TIME",
        "location": "San Francisco, CA",
        "summary": "We are looking for an experienced Senior Software Engineer...",
        "responsibilities": "Design and implement scalable solutions...",
        "requiredQualifications": "5+ years of experience in software development...",
        "preferredQualifications": "Experience with cloud technologies...",
        "status": "OPEN",
        "autoRejectThreshold": 30,
        "autoPassThreshold": 85,
        "companyId": "550e8400-e29b-41d4-a716-446655440000",
        "companyName": "Tech Corp",
        "skills": [
          {"id": "skill-id-1", "name": "Java"},
          {"id": "skill-id-2", "name": "Spring Boot"}
        ]
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10,
      "totalElements": 5,
      "totalPages": 1
    }
  }
}
```

---

### 5. Get All Open Job Listings

**Endpoint:** `GET /api/v1/jobs`

**Status Code:** 200 OK

**Description:** Retrieve all open job listings (public listings available to applicants).

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 0 | Zero-based page number |
| `size` | integer | 10 | Number of items per page |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Open job listings retrieved",
  "data": {
    "content": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "title": "Senior Software Engineer",
        "type": "FULL_TIME",
        "location": "San Francisco, CA",
        "summary": "We are looking for an experienced Senior Software Engineer...",
        "responsibilities": "Design and implement scalable solutions...",
        "requiredQualifications": "5+ years of experience in software development...",
        "preferredQualifications": "Experience with cloud technologies...",
        "status": "OPEN",
        "autoRejectThreshold": 30,
        "autoPassThreshold": 85,
        "companyId": "550e8400-e29b-41d4-a716-446655440000",
        "companyName": "Tech Corp",
        "skills": [
          {"id": "skill-id-1", "name": "Java"},
          {"id": "skill-id-2", "name": "Spring Boot"}
        ]
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10,
      "totalElements": 150,
      "totalPages": 15
    }
  }
}
```

---

### 6. Delete Job Listing

**Endpoint:** `DELETE /api/v1/jobs/{id}`

**Status Code:** 200 OK

**Description:** Delete a job listing. Only the company owner can delete.

**Request Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Job Listing UUID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job listing deleted successfully"
}
```

**Error Responses:**

**403 Forbidden - Insufficient Permissions:**
```json
{
  "success": false,
  "message": "You don't have permission to delete this job listing"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Job listing not found"
}
```

---

## Skills Endpoints

### Base URL
```
/api/v1/skills
```

**Authentication:** Required for POST (JWT Token)

---

### 1. Create Skill

**Endpoint:** `POST /api/v1/skills`

**Status Code:** 201 Created

**Description:** Create a new skill that can be associated with job listings.

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Java"
}
```

**Request Validations:**
- `name`: Required, non-empty, max 150 characters

**Success Response (201):**
```json
{
  "success": true,
  "message": "Skill created successfully",
  "data": {
    "id": "skill-id-1",
    "name": "Java"
  }
}
```

**Error Responses:**

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "message": "Skill name is required, Skill name must be at most 150 characters"
}
```

**409 Conflict - Skill Already Exists:**
```json
{
  "success": false,
  "message": "A skill with this name already exists"
}
```

---

### 2. Search Skills

**Endpoint:** `GET /api/v1/skills/search`

**Status Code:** 200 OK

**Description:** Search for skills by name (partial matching supported).

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search term (partial matches supported) |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Skills retrieved",
  "data": [
    {
      "id": "skill-id-1",
      "name": "Java"
    },
    {
      "id": "skill-id-2",
      "name": "JavaScript"
    }
  ]
}
```

**Error Responses:**

**400 Bad Request - Missing Query:**
```json
{
  "success": false,
  "message": "Search query is required"
}
```

---

## Frontend Integration Checklist

- [ ] Implement registration form with all required fields and client-side validation
- [ ] Display appropriate error messages from API responses
- [ ] Handle email duplicate (409 CONFLICT) with user-friendly message
- [ ] Implement OTP verification form after registration
- [ ] Set up JWT token storage (localStorage/sessionStorage) after successful login
- [ ] Include Authorization header in all authenticated requests
- [ ] Handle token expiration and prompt re-login if needed
- [ ] Display loading states during API calls
- [ ] Implement error retry logic with exponential backoff for network failures
- [ ] Create company form with validation for company creation/update
- [ ] Implement job listing form with rich text editor for descriptions
- [ ] Add pagination controls for company and job listing lists
- [ ] Implement skill search with autocomplete
- [ ] Create job listing detail view with company information
- [ ] Add job filtering by company, status, type, and location

---

## Example Integration Flow

### Registration and Verification Flow
1. User submits registration form → POST `/api/v1/auth/register`
2. Display success message and OTP verification screen
3. User enters OTP → POST `/api/v1/auth/verify-otp`
4. Display success and redirect to login

### Login Flow
1. User submits login form → POST `/api/v1/auth/login`
2. If email not verified (403), show OTP screen
3. User submits OTP → POST `/api/v1/auth/verify-otp`
4. User re-attempts login → POST `/api/v1/auth/login`
5. Store received JWT token in localStorage/sessionStorage
6. Redirect to dashboard based on user role

### Company Management Flow (HR Manager)
1. Navigate to company settings
2. Create company → POST `/api/v1/companies`
3. Update company info → PUT `/api/v1/companies/{id}`
4. View company details → GET `/api/v1/companies/{id}`

### Job Listing Management Flow (HR Manager)
1. Navigate to job listings
2. Create job listing → POST `/api/v1/jobs`
3. Search skills for job → GET `/api/v1/skills/search?query=java`
4. Update job listing → PUT `/api/v1/jobs/{id}`
5. View job listings by company → GET `/api/v1/jobs/company/{companyId}`
6. Delete job listing → DELETE `/api/v1/jobs/{id}`

### Job Discovery Flow (Applicant)
1. Search for open jobs → GET `/api/v1/jobs?page=0&size=10`
2. Filter by company → GET `/api/v1/jobs/company/{companyId}`
3. View job details → GET `/api/v1/jobs/{id}`
4. Apply for job or save for later
