# MauMain API Documentation

GCP IP:

DOMAIN:

Test using Postman (import):

## Models :

_Users_

```
- _id_: ObjectId
- username: string, unique, required
- email: string, unique, required
- role: player | admin
- phoneNumber: string, required
- password: string, required
```


## Endpoints :

### Public endpoints:

- `POST /login`
- `POST /register`

# Routes

## 1. POST /login

Description:

- Logs user in using username or email

- body:

```json
{
  "usernameOrMail": "string (required)",
  "password": "string(required)"
}
```

_Response (200 - OK)_

```json
{
  "statusCode": 200,
  "message": "User logged in successfully",
  "data": {
    "access_token": "string",
    "username": "string",
    "role": "string"
  }
}
```

_Response (400 - Bad Request)_

```json
{
  "statusCode": 400,
  "message": "Please Fill the required field",
  "data": {}
}
```

_Response (400 - Bad Request)_

```json
{
  "statusCode": 400,
  "message": "Invalid username/email or password",
  "data": {}
}
```

## 2. POST /register

Description:

- Registers new users with selected role and logs user in

- body:

```json
{
  "username": "string (required)",
  "email": "string (required)",
  "phoneNumber": "string (required)",
  "password": "string(required)",
  "role": "string(required)"
}
```

_Response (201 - created)_

```json
{
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "access_token": "string",
    "username": "string",
    "role": "string"
  }
}
```

_Response (400 - Bad Request)_

```json
{
  "statusCode": 400,
  "message": "Please Fill the required field",
  "fields": ["username" | "email" | "phoneNumber" | "role" | "password" ],
  "data": {}
}
```

_Response (400 - Bad Request)_

```json
{
  "statusCode": 400,
  "message": "[username | email] already used",
  "fields": ["username" | "email"],
  "data": {}
}
```

```
