# Create Thread
- URL : `/forum/threads`
- Method : `POST`
- Description : Creates a new discussion thread.
- Auth Required : Yes

## Example Request
```json
POST /forum/threads
Content-Type: application/json
Authorization: Bearer <TOKEN>

{
  "title": "Best Budget Laptops for Students?",
  "description": "I’m looking for a good budget laptop for college. Any suggestions?"
}
```

## Example Response
```json
{
  "id": 1,
  "title": "Best Budget Laptops for Students?",
  "description": "I’m looking for a good budget laptop for college. Any suggestions?",
  "created_at": "2025-03-21T12:00:00",
  "user_id": 2
}
```

## Possible Responses
- 400 : Invalid data (missing title or desc).
- 401 : Auth required (unauthenticated request)
- 500 : Internal server error

# Get Threads
- URL : `/forum/threads/`
- Method : `GET`
- Description : Retrieves list of discussion threads with pagination.
- Auth Required : No

**Query Parameters**
limit - int - Number of threads per request (default : 10, max  : 100)
offset - int - Number of threads to skip (default : 0)

## Example Request
```json
GET /forum/threads?limit=10&offset=0
```
*Above code retrives 10 threads starting with id 0*

## Example Response
```json
[
  {
    "id": 1,
    "title": "Best Budget Laptops for Students?",
    "description": "I’m looking for a good budget laptop for college. Any suggestions?",
    "created_at": "2025-03-21T12:00:00",
    "user_id": 2
  },
  {
    "id": 2,
    "title": "Best Programming Languages in 2025",
    "description": "Which programming languages will be most useful in 2025?",
    "created_at": "2025-03-22T15:30:00",
    "user_id": 3
  }
]
```

## Possible Response
- 500 : Internal Server Error

# Specific Thread With Replies
- URL : `/forum/threads/{thread_id}`
- Method : `GET`
- Description : Retrives a specific thread with replies.
- Auth Required : No

## Example Request
```json
GET /forum/threads/1
```

## Example Response
```json
{
  "id": 1,
  "title": "Best Budget Laptops for Students?",
  "description": "I’m looking for a good budget laptop for college. Any suggestions?",
  "created_at": "2025-03-21T12:00:00",
  "user_id": 2,
  "replies": [
    {
      "id": 1,
      "content": "Check out the M1 MacBook Air, it has great battery life!",
      "created_at": "2025-03-21T14:00:00",
      "user_id": 3
    }
  ]
}
```

## Possible Responses
- 400 : Thread not found
- 500 : Internal server error.

# Latest 10 Threads
- URL : `/forum/latest-threads`
- Method : `GET`
- Description : Retrieves the 10 latest threads
- Auth Required : Yes

## Example Request
```json
GET /forum/latest-threads
Authorization: Bearer <TOKEN>
```

## Example Response
```json
[
  {
    "id": 3,
    "title": "AI in Healthcare",
    "description": "How is AI transforming healthcare in 2025?",
    "created_at": "2025-03-22T18:00:00",
    "user_id": 5
  },
  {
    "id": 2,
    "title": "Best Programming Languages in 2025",
    "description": "Which programming languages will be most useful in 2025?",
    "created_at": "2025-03-22T15:30:00",
    "user_id": 3
  }
]
```

## Possible Responses
- 401 : Authentication required.
- 500 : Internal Server error

# Delete Thread
- URL : `/forum/threads/{thread_id}`
- Method : `DELETE`
- Description : Deletes a thread (only if the user posted or is admin).
- Auth Required : Yes

## Example Request
```json
DELETE /forum/threads/1
Authorization: Bearer <TOKEN>
```

## Example Response
```json
{
  "message": "Thread deleted successfully"
}
```

## Possible Responses
- 403 : User not allowed to delete thread.
- 404 : Thread not found
- 500 : Internal server error

# Create Reply
- URL : `/forum/threads/{thread_id}/replies`
- Method : `POST`
- Description : Adds reply to a thread.
- Auth Required : Yes

## Example Request
```json
POST /forum/threads/1/replies
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "content": "Check out the M1 MacBook Air, it has great battery life!"
}
```

## Example Response
```json
{
  "id": 1,
  "content": "Check out the M1 MacBook Air, it has great battery life!",
  "created_at": "2025-03-21T14:00:00",
  "user_id": 3,
  "thread_id": 1
}
```

## Possible Responses
- 404 : Thread not found
- 500 : Internal server error

# Delete Reply
- URL : `/forum/replies/{reply_id}`
- Method : `DELETE`
- Description : Delete a reply (only if user is owner or admin).
- Auth Required : Yes

## Example Request
```json
DELETE /forum/replies/1
Authorization: Bearer <TOKEN>
```

## Example Response
```json
{
  "message": "Reply deleted successfully"
}
```
## Possible Responses
- 403 : User is not allowed to delete the reply.
- 404 : Reply not found 
- 500 : Internal server error.
