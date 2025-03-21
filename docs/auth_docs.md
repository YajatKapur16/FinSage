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