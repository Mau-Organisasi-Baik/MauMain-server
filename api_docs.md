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
- tags: tag[]
- photos: string[]
```

_Friend_

```
- _id: ObjectId
- user1:
```

## Endpoints :

### Public endpoints:

- `POST /login`
- `POST /register`
- `GET /tags`

### Player endpoints:

- `POST /profile`
- `PUT /profile`
- `GET /profile/me`
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

#### Chat / notification endpoints

- `GET /friends`
- `POST /friends`
- `GET /friends/pending`
- `GET /notifications`
- `POST /invite`

### Field endpoints:

- `POST /profile`
- `GET /profile/me`
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

### 3. GET /tags

Description:

- Retrieves all tags available

_Response (200 - OK)_

```json
{
  "statusCode": 200,
  "message": "Tags retrieved successfully",
  "data": {
    "tags": [
      {
        "_id": "string",
        "name": "string",
        "limit": "number",
      }, ...
    ]
  }
}
```

## Player Endpoints

### Profile Routes

#### 1. GET /profile/

Description:

- Get profile of current logged in user

- headers:

```json
{
  "authorization": "Bearer [token]"
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

#### 2. POST /profile

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
  "photo": "File (required)"
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
  "fields": ["name" | "photo"],
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

#### 3. GET /profile/:playerId

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

#### 4. PUT /profile

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
  "photo": "File (required)"
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
  "message": "Please Fill any field",
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

### Explore Routes

#### 1. GET /fields/explore

Description:

- Fetch field list around user with current user coordinates
- Fetch field by type if available

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
  "longitude": "number (required)",
  "tagId": "string (required)"
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
        "name": "string",
        "address": "string",
        "coordinates": "number[]",
        "tags": [
          {
            "id": "string",
            "name": "string",
            "limit": "number",
          }
        ],
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

### Reservation Routes

#### 1. GET /fields/:id/reservations

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

#### 2. GET /reservations/:reservationId

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
      "status":  "upcoming" | "ended",
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

#### 3. POST /reservations/

Description:

- Creates a reservation based on schedule

- headers

```json
{
  "authorization": "Bearer [token]"
}
```

- body:

````json
{
  "fieldId": "string (required)",
  "scheduleId": "string (required)",
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
  "fields": ["tag" | "type" | "schedule"],
  "data": {}
}
```

_Response (400 - Bad Request)_

```json
{
  "statusCode": 409,
  "message": "Invalid [tag | type | schedule]",
  "data": {}
}
```

_Response (400 - Bad Request)_

```json
{
  "statusCode": 400,
  "message": "Duplicate reservation",
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
  "message": "Schedule not found",
  "data": {}
}
```

#### 4. PUT /reservation/:reservationId/join

Description:

- Joins player into selected reservation

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

#### 5. PUT /reservation/reservationId/leave

Description:

- leave user from selected reservation
- (note) deletes a reservation when there are no users in reservation

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

### Friends Routes

#### 1. GET /friends

Description:

- Get all friends (non-pending) of logged in user

- headers

```json
{
  "authorization": "Bearer [token]"
}
```

_Response (200 - OK)_

```json
{
  "statusCode": 200,
  "message": "Friend list retrieved successfully",
  "data": {
    "friends": [
      {
        "_id": "string",
        "playerId": "string",
        "name": "string"
      },...
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

#### 2. POST /friends

Description:

- Send friend request

- headers

```json
{
  "authorization": "Bearer [token]"
}
```

- body

```json
{
  "targetPlayerId": "string"
}
```

_Response (201 - Created)_

```json
{
  "statusCode": 201,
  "message": "Friend request sent successfully",
  "data": {}
}
```

_Response (400 - Bad Request)_

```json
{
  "statusCode": 400,
  "message": "Can't send friend request to yourself",
  "data": {}
}
```

_Response (400 - Bad Request)_

```json
{
  "statusCode": 400,
  "message": "Already friends",
  "data": {}
}
```

_Response (400 - Bad Request)_

```json
{
  "statusCode": 400,
  "message": "Already requesting",
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
  "message": "Player not found",
  "data": {}
}
```

#### 3. GET /friends/pending

Description:

- Send friend request

- headers

```json
{
  "authorization": "Bearer [token]"
}
```

_Response (200 - OK)_

```json
{
  "statusCode": 200,
  "message": "Pending friend request retrieved successfully",
  "data": {
    "pendings": [
      {
        "_id": "string",
        "playerId": "string",
        "name": "string"
      },
      ...
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

#### 4. PUT /friends/:friendsId/accept

Description:

- Accept friend request

- headers

```json
{
  "authorization": "Bearer [token]"
}
```

- parameters

```json
{
  "friendsId": "string (required)"
}
```

_Response (200 - OK)_

```json
{
  "statusCode": 200,
  "message": "Friend request accepted successfully",
  "data": {}
}
```

_Response (400 - Bad Request)_

```json
{
  "statusCode": 400,
  "message": "Already accepted",
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
  "message": "Friend request not found",
  "data": {}
}
```

#### 5. DELETE /friends/:friendsId/reject

Description:

- Reject friend request

- headers

```json
{
  "authorization": "Bearer [token]"
}
```

- parameters

```json
{
  "friendsId": "string (required)"
}
```

_Response (200 - OK)_

```json
{
  "statusCode": 200,
  "message": "Friend request rejected successfully",
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
  "message": "Friend request not found",
  "data": {}
}
```

### Invite Routes

#### 1. GET /invite

Description:

- Get all invites from other players

- headers

```json
{
  "authorization": "Bearer [token]"
}
```

_Response (200 - OK)_

```json
{
  "statusCode": 200,
  "message": "Invitation requests retrieved successfully",
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

#### 2. POST /invite

Description:

- Send Invite to other player on selected reservation

- headers

```json
{
  "authorization": "Bearer [token]"
}
```

- body

```json
{
  "inviteeId": "string",
  "reservationId": "string"
}
```

_Response (201 - Created)_

```json
{
  "statusCode": 201,
  "message": "Invitation sent successfully",
  "data": {}
}
```

_Response (400 - Bad Request)_

```json
{
  "statusCode": 400,
  "message": "Please Fill the required field",
  "fields" : ["inviteeId" | "reservationId"],
  "data": {}
}
```

_Response (400 - Bad Request)_

```json
{
  "statusCode": 400,
  "message": "Reservation already ended",
  "data": {}
}
```

_Response (400 - Bad Request)_

```json
{
  "statusCode": 400,
  "message": "Can't invite yourself",
  "data": {}
}
```

_Response (400 - Bad Request)_

```json
{
  "statusCode": 400,
  "message": "Reservation is full",
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
  "message": "Player not found",
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

### Profile Routes

#### 1. GET /admin/profile

Description:

- retrieves current field profile

_Response (200 - OK)_

```json
{
  "statusCode": 200,
  "message": "Field profile retrieved successfully",
  "data": {
    "field": {
      "name": "string",
      "address": "string",
      "coordinates": "number[]",
      "tags": "tag[]",
      "photoUrls": "string[]"
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

#### 2. POST /admin/profile

Description:

- insert field profile for first time

- body:

```json
{
  "name": "string (required)",
  "address": "string (required)",
  "coordinates": "number[] (required)",
  "tagIds": "string[] (required)",
  "photos": "file[] (required)"
}
```

_Response (200 - OK)_

```json
{
  "statusCode": 200,
  "message": "Field profile updated successfully",
  "data": {}
}
```

_Response (400 - Bad Request)_

```json
{
  "statusCode": 400,
  "message": "Please Fill the required field",
  "fields": ["name" | "address" | "coordinates" | "tagIds" | "photos" ],
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

#### 3. PUT /admin/profile

Description:

- updates field profile

- body:

```json
{
  "name": "string (optional)",
  "address": "string (optional)",
  "coordinates": "number[] (optional)",
  "tagIds": "string[] (optional)",
  "photos": "file[] (optional)"
}
```

_Response (200 - OK)_

```json
{
  "statusCode": 200,
  "message": "Field profile updated successfully",
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

### Field Management routes

#### 1. GET /admin/reservations

Description:

- retrieves all reservations

_Response (200 - OK)_

```json
{
  "statusCode": 200,
  "message": "Field reservations retrieved successfully",
  "data": {
    "reservations": [
      {
        "_id": "string",
        "fieldId": "string",
        "schedule": {
          "TimeStart": "string",
          "TimeEnd": "string",
        },
        "date": "yyyy-mm-dd",
        "players": [
          {
            "_id": "string",
            "name": "string",
            "profilePictureUrl": "string"
          }, ...
        ],
        "tag": {
          "_id": "string",
          "name": "string",
          "limit": "number"
        },
        "status": "upcoming | ended",
      }, ...
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

#### 2. GET /admin/reservations/:reservationId

Description:

- retrieves selected reservation

_Response (200 - OK)_

```json
{
  "statusCode": 200,
  "message": "Field reservations retrieved successfully",
  "data": {
    "reservations": {
      "_id": "string",
      "fieldId": "string",
      "schedule": {
        "TimeStart": "string",
        "TimeEnd": "string",
      },
      "date": "yyyy-mm-dd",
      "players": [
        {
          "_id": "string",
          "name": "string",
          "profilePictureUrl": "string"
        }, ...
      ],
      "tag": {
        "_id": "string",
        "name": "string",
        "limit": "number"
      },
      "status": "upcoming | ended",
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

#### 3. PUT /admin/reservations/:reservationId/kick

Description:

- Kicks player from a reservation

- body

```json
{
  "selectedPlayerId": "string"
}
```

_Response (200 - OK)_

```json
{
  "statusCode": 200,
  "message": "Player kicked successfully",
  "data": {}
}
```

_Response (403 - Forbidden)_

```json
{
  "statusCode": 403,
  "message": "Reservation already ended",
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

_Response (404 - Not Found)_

```json
{
  "statusCode": 403,
  "message": "Player not found",
  "data": {}
}
```

_Response (404 - Not Found)_

```json
{
  "statusCode": 403,
  "message": "Reservation not found",
  "data": {}
}
```

#### 4. PUT /admin/reservations/:reservationId/score

Description:

- Scores a competitive reservation

- body

```json
{
  "score": "number|number"
}
```

_Response (200 - OK)_

```json
{
  "statusCode": 200,
  "message": "Score inputted successfully",
  "data": {}
}
```

_Response (400 - Bad Request)_

```json
{
  "statusCode": 400,
  "message": "Reservation type is not competitive",
  "data": {}
}
```

_Response (400 - Bad Request)_

```json
{
  "statusCode": 400,
  "message": "Reservation already ended",
  "data": {}
}
```

_Response (400 - Bad Request)_

```json
{
  "statusCode": 400,
  "message": "Please Fill the required field",
  "field": ["score"],
  "data": {}
}
```

_Response (400 - Bad Request)_

```json
{
  "statusCode": 400,
  "message": "Invalid score format",
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

_Response (404 - Not Found)_

```json
{
  "statusCode": 403,
  "message": "Reservation not found",
  "data": {}
}
```

#### 5. PUT /admin/reservations/:reservationId/end

Description:

- Ends a casual reservation

_Response (200 - OK)_

```json
{
  "statusCode": 200,
  "message": "Reservation ended successfully",
  "data": {}
}
```

_Response (400 - Bad Request)_

```json
{
  "statusCode": 400,
  "message": "Competitive Reservation needs to scored",
  "data": {}
}
```

_Response (400 - Bad Request)_

```json
{
  "statusCode": 400,
  "message": "Reservation already ended",
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

_Response (404 - Not Found)_

```json
{
  "statusCode": 403,
  "message": "Reservation not found",
  "data": {}
}
```

#### 6. DELETE /admin/reservations/:reservationId

Description:

- deletes / cancels any reservation

_Response (200 - OK)_

```json
{
  "statusCode": 200,
  "message": "Reservation deleted successfully",
  "data": {}
}
```

_Response (403 - Forbidden)_

```json
{
  "statusCode": 403,
  "message": "Reservation already ended",
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

_Response (404 - Not Found)_

```json
{
  "statusCode": 403,
  "message": "Reservation not found",
  "data": {}
}
```
