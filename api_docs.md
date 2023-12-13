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

_Players_

```
- _id: ObjectId
- UserId: ObjectId
- User: User
- name: string, required
- profilePictureUrl: string
- exp: number
```

_Field_

```
- _id: ObjectId
- UserId: number
- User: User
- name: string, required
- address: string
- coordinates: number[]
- tags: string[]
- photos: string[]
```

## Endpoints :

### Public endpoints:

- `POST /login`
- `POST /register`

### Player endpoints:

- `PUT /profile`
- `GET /profile/:playerId`

#### Explore endpoints:

- `GET /fields/explore`
- `GET /fields/:id`

#### Reservation endpoints:

- `GET /fields/:id/reservations`
- `GET /reservations/:id`
- `POST /reservations/:id`
- `PUT /reservations/:id/join`
- `PUT /reservations/:id/leave`

### Field endpoints:

- `PUT /profile`

# Routes

## Public endpoints:

### 1. POST /login

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

### 2. POST /register

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

## Player Endpoints

### Profile Routes

#### 1. PUT /profile

Description:

- Renews player profile

- headers:

```json
{
  "authorization": "Bearer [token]"
}
```

- body:

```json
{
  "name": "string (required)",
  "profilePictureUrl": "string (required)"
}
```

_Response (200 - OK)_

```json
{
  "statusCode": 200,
  "message": "Player profile updated successfully",
  "data": {}
}
```

_Response (400 - Bad Request)_

```json
{
  "statusCode": 400,
  "message": "Please Fill the required field",
  "fields": ["name" | "profilePictureUrl"],
  "data": {}
}
```

_Response (403 - Forbidden)_

```json
{
  "statusCode": 403,
  "message": "Invalid token",
  "data": {}
}
```

#### 2. GET /profile/:playerId

Description:

- Get player profile

- headers:

```json
{
  "authorization": "Bearer [token]"
}
```

- parameters:

```json
{
  "playerId": "string"
}
```

_Response (200 - OK)_

```json
{
  "statusCode": 200,
  "message": "Player profile retrieved successfully",
  "data": {
    "user": {
      "name": "string",
      "profilePictureUrl": "string",
      "exp": "number"
    }
  }
}
```

_Response (403 - Forbidden)_

```json
{
  "statusCode": 403,
  "message": "Invalid token",
  "data": {}
}
```

_Response (404 - Not found)_

```json
{
  "statusCode": 404,
  "message": "Player not found",
  "data": {}
}
```

### Explore Routes

#### 1. GET /fields/explore

Description:

- Fetch field list around user with current user coordinates

- headers:

```json
{
  "authorization": "Bearer [token]"
}
```

- parameters:

```json
{
  "latitude": "number (required)",
  "longitude": "number (required)"
}
```

_Response (200 - OK)_

```json
{
  "statusCode": 200,
  "message": "OK!",
  "data": {
    "fields": [
      {
        "_id": "string",
        "name": "string, required",
        "address": "string",
        "coordinates": "number[]",
        "tags": "string[]",
        "photoUrls": "string[]"
      }, ...
    ]
  }
}
```

_Response (400 - Bad Request)_

```json
{
  "statusCode": 400,
  "message": "Invalid coordinates",
  "fields": ["longitude" | "latitude"],
  "data": {}
}
```

_Response (403 - Forbidden)_

```json
{
  "statusCode": 403,
  "message": "Invalid token",
  "data": {}
}
```

#### 2. GET /fields/:fieldId

Description:

- Get Field details from field ID

- headers

```json
{
  "authorization": "Bearer [token]"
}
```

- parameters:

```json
{
  "fieldId": "string"
}
```

_Response (200 - OK)_

```json
{
  "statusCode": 200,
  "message": "Field detail retrieved successfully",
  "data": {
    "field": {
      "_id": "string",
      "name": "string",
      "address": "string",
      "coordinates": "number[]",
      "tags": "string[]",
      "photoUrls": "string[]"
    }
  }
}
```

### 3. GET /fields/:id/reservations

Description:

- Get all reservations in selected field

- headers

```json
{
  "authorization": "Bearer [token]"
}
```

- parameters:

```json
{
  "fieldId": "string"
}
```

_Response (200 - OK)_

```json
{
  "statusCode": 200,
  "message": "Field reservations retrieved successfully",
  "data": {
    "reservations": [
      {
        "_id": "string",
        "fieldId": "ObjectId",
        "tag?": {
          "_id": "string",
          "name": "string",
          "limit": 10,
        },
        "type?": "competitive" | "casual",
        "score?": "string",
        "status": "empty" | "upcoming" | "playing" | "ended",
        "schedule": {
          "_id": "string",
          "TimeStart": "string",
          "TimeEnd": "string",
        },
        "date": "string",
        "players": [
          {
            "_id": "string",
            "userId": "string",
            "profilePictureUrl": "string",
            "exp": "number",
            "name": "string",
          }
        ],
      }
    ]
  }
}
```

_Response (403 - Forbidden)_

```json
{
  "statusCode": 403,
  "message": "Invalid token",
  "data": {}
}
```

_Response (404 - Not found)_

```json
{
  "statusCode": 404,
  "message": "Field not found",
  "data": {}
}
```

### 4. GET /reservations/:reservationId

Description:

- Get selected reservation

- headers

```json
{
  "authorization": "Bearer [token]"
}
```

- parameters:

```json
{
  "reservationId": "string"
}
```

_Response (200 - OK)_

```json
{
  "statusCode": 200,
  "message": "Reservation retrieved successfully",
  "data": {
    "reservation": {
      "_id": "string",
      "fieldId": "ObjectId",
      "tag?": {
        "_id": "string",
        "name": "string",
        "limit": 10,
      },
      "type?": "competitive" | "casual",
      "score?": "string",
      "status": "empty" | "upcoming" | "playing" | "ended",
      "schedule": {
        "_id": "string",
        "TimeStart": "string",
        "TimeEnd": "string",
      },
      "date": "string",
      "players": [
        {
          "_id": "string",
          "userId": "string",
          "profilePictureUrl": "string",
          "exp": "number",
          "name": "string",
        }
      ],
    }
  }
}
```

_Response (403 - Forbidden)_

```json
{
  "statusCode": 403,
  "message": "Invalid token",
  "data": {}
}
```

_Response (404 - Not found)_

```json
{
  "statusCode": 404,
  "message": "Reservation not found",
  "data": {}
}
```

### 5. POST /reservations/:reservationId

Description:

- Get make reservation from empty and change the reservation content

- headers

```json
{
  "authorization": "Bearer [token]"
}
```

- parameters:

````json
{
  "reservationId": "string"
}

- body:

```json
{
  "tagId": "string (required)",
  "type": "competitive" | "casual" "(required)",
}

_Response (201 - Created)_

```json
{
  "statusCode": 201,
  "message": "Reservation made successfully",
  "data": {}
}
````

_Response (400 - Bad Request)_

```json
{
  "statusCode": 400,
  "message": "Please fill the required field",
  "fields": ["tag" | "type"],
  "data": {}
}
```

_Response (400 - Bad Request)_

```json
{
  "statusCode": 409,
  "message": "Invalid [tag | type]",
  "data": {}
}
```

_Response (403 - Forbidden)_

```json
{
  "statusCode": 403,
  "message": "Invalid token",
  "data": {}
}
```

_Response (403 - Forbidden)_

```json
{
  "statusCode": 403,
  "message": "Reservation already made before",
  "data": {}
}
```

_Response (404 - Not found)_

```json
{
  "statusCode": 404,
  "message": "Reservation not found",
  "data": {}
}
```

### 6. PUT /reservation/reservationId/join

Description:

- Get make reservation from empty and change the reservation content

- headers

```json
{
  "authorization": "Bearer [token]"
}
```

- parameters:

```json
{
  "reservationId": "string"
}
```

_Response (200 - OK)_

```json
{
  "statusCode": 200,
  "message": "Joined successfully into reservation",
  "data": {}
}
```

_Response (403 - Forbidden)_

```json
{
  "statusCode": 403,
  "message": "Already joined",
  "data": {}
}
```

_Response (403 - Forbidden)_

```json
{
  "statusCode": 403,
  "message": "Reservation full",
  "data": {}
}
```

_Response (403 - Forbidden)_

```json
{
  "statusCode": 403,
  "message": "Reservation already playing / ended",
  "data": {}
}
```

_Response (403 - Forbidden)_

```json
{
  "statusCode": 403,
  "message": "Invalid token",
  "data": {}
}
```

_Response (404 - Not found)_

```json
{
  "statusCode": 404,
  "message": "Reservation not found",
  "data": {}
}
```

### 7. PUT /reservation/reservationId/leave

Description:

- leave user from selected reservation
- (note) resets a reservation into empty when there are no users in reservation

- headers

```json
{
  "authorization": "Bearer [token]"
}
```

- parameters:

````json
{
  "reservationId": "string"
}

_Response (200 - OK)_

```json
{
  "statusCode": 200,
  "message": "Left successfully from reservation",
  "data": {}
}
````

_Response (403 - Forbidden)_

```json
{
  "statusCode": 403,
  "message": "Not joined before",
  "data": {}
}
```

_Response (403 - Forbidden)_

```json
{
  "statusCode": 403,
  "message": "Reservation already playing / ended",
  "data": {}
}
```

_Response (403 - Forbidden)_

```json
{
  "statusCode": 403,
  "message": "Invalid token",
  "data": {}
}
```

_Response (404 - Not found)_

```json
{
  "statusCode": 404,
  "message": "Reservation not found",
  "data": {}
}
```

## Field Endpoints

### 1. POST /profile

Description:

- Renews field profile

- body:

```json
{
  "name": "string (required)",
  "address": "string (required)",
  "coordinates": "number[] (required)",
  "tags": "string[] (required)",
  "photoUrls": "string[] (required)"
}
```

_Response (200 - OK)_

```json
{
  "statusCode": 200,
  "message": "Player profile updated successfully",
  "data": {}
}
```

_Response (400 - Bad Request)_

```json
{
  "statusCode": 400,
  "message": "Please Fill the required field",
  "fields": ["name" | "address" | "coordinates" | "tags" | "photoUrls" ],
  "data": {}
}
```

_Response (403 - Forbidden)_

```json
{
  "statusCode": 403,
  "message": "Invalid token",
  "data": {}
}
```
