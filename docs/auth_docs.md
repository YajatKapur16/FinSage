# Authentication Flow
1. User logs in with their credentials. Server returns a JWT token. (Refer User Login)
2. The frontend must include the token in the Authorization header for all protected requests
`Authorization : Bearer <TOKEN>`
3. Server validates the token before all protected routes.

# Authentication Middleware
Handles authentication and authorization for all requests. 

## Usage
For any protected route -> use the following authentication middlware in the route code.
```python
from fastapi import Depends
from app.auth import get_current_user

@app.get("/protected-endpoint")
def protected_route(current_user: User = Depends(get_current_user)):
    # Your code here.
```
This uses JWT token and authenticates the user and checks if they are allowed to perform the action.

## Admin Usage
If you have a route that can only be accessed by admins then use the following code
```python
@app.post("/endpoint")
def admin_only_action(current_user: User = Depends(check_admin)):
    return {"message": "Admin action performed."}
```

## Possible Responses
200 - Success, returns user details.
401 - Unauthorized.
403 - Forbidden

# User Registration
- url : `/auth/register/`
- method : `POST`
- description : Registers a new user with email, full name, password. Unique email and password strength is validated.
- auth required : No.

## Example Request
```json
POST /auth/register
Content-Type: application/json
{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "password": "StrongP@ssw0rd",
  "phone_number": "+1234567890"
}
```
## Example Response
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+1234567890"
  }
}
```

## Possible Responses
- 400 : Invalid Email Format
- 400 : Password too Weak
- 409 : Email already registered
- 500 : Internal Server Error

# User Login
- url : `/auth/login`
- method : `POST`
- description : Login with email and password. Locks account for 3 failed attempts. Returns bearer token.
- auth required : No.

## Example Request
```json
POST /auth/register
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "StrongP@ssw0rd"
}
```
## Example Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1...",
  "token_type": "bearer"
}
```
## Possible Responses
- 200 : Successful login
- 401 : Invalid credentials
- 403 : Locked account

# Admin Registration
- url : `/auth/admin/register/`
- method : `POST`
- description : Registers a new admin with email, full name, password. Unique email and password strength is validated.
- auth required : No.

## Example Request
```json
POST /auth/admin/register/
Content-Type: application/json
{
  "email": "admin@example.com",
  "first_name": "admin",
  "last_name": "adminus",
  "phone_number": "123456789",
  "password": "admin_pass"
}
```
## Example Response
```json
{
  "message": "Admin registered successfully"
}
```
## Possible Responses
- 200 : Successful login
- 422 : Validation error



# Dummy User To Test Registration & Login
```json
{
  "email": "test_user@example.com",
  "first_name": "test",
  "last_name": "user",
  "phone_number": "9999999999",
  "password": "test_password"
}
```