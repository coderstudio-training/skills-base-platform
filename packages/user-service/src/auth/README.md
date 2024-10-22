# Authentication API

This document provides an overview of the authentication API, including how to use Google OAuth for authentication.

## Endpoints

### 1. Register

- **URL**: `/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "roles": ["user"]
  }
  ```

### 2. Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "roles": ["user"]
  }
  ```

### 3. Google OAuth

- **URL**: `/auth/google`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "token": "Google_ID_Token"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "roles": ["user"]
  }
  ```

## Google OAuth Flow

To authenticate users with Google OAuth:

1. Set up Google OAuth in your frontend application:

   - Configure the Google Sign-In button in your frontend.
   - When the user clicks the button, initiate the Google Sign-In flow.

2. After successful Google Sign-In, you'll receive a Google ID token.

3. Send this token to your backend:

   ```javascript
   const response = await fetch('/auth/google', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({ token: googleIdToken }),
   });
   const data = await response.json();
   ```

4. The backend will verify the token, create or update the user account, and return a JWT token along with the user's roles.

5. Store the JWT token securely (e.g., in HttpOnly cookies) and use it for subsequent authenticated requests.

6. Use the returned roles to determine if the user is an employee or manager and adjust the UI accordingly.

## Error Handling

The API will return appropriate HTTP status codes and error messages in case of failures. Make sure to handle these errors gracefully in your frontend application.

## Security Considerations

- Always use HTTPS in production to encrypt data in transit.
- Store JWT tokens securely and implement proper token refresh mechanisms.
- Implement rate limiting and other security measures to prevent abuse.
