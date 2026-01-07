# HorizonX CMS API Documentation

Base URL: `http://localhost:8000/api/v1`

## Authentication

All protected endpoints require Bearer token in Authorization header:
```
Authorization: Bearer {your_token}
```

## Endpoints

### Authentication

#### Register
```
POST /auth/register
Body: {
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

#### Login
```
POST /auth/login
Body: {
  "email": "john@example.com",
  "password": "password123"
}
Response: {
  "success": true,
  "data": {
    "user": {...},
    "token": "1|..."
  }
}
```

#### Get Current User
```
GET /auth/me
Headers: Authorization: Bearer {token}
```

#### Logout
```
POST /auth/logout
Headers: Authorization: Bearer {token}
```

#### Forgot Password
```
POST /auth/forgot-password
Body: {
  "email": "john@example.com"
}
```

#### Reset Password
```
POST /auth/reset-password
Body: {
  "token": "...",
  "email": "john@example.com",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

### Businesses

#### Get Businesses
```
GET /businesses
Headers: Authorization: Bearer {token}
```

#### Create Business
```
POST /businesses
Headers: Authorization: Bearer {token}
Body: {
  "name": "My Business",
  "industry": "Technology",
  "description": "Description here",
  "social_links": {}
}
```

#### Get Business
```
GET /businesses/{id}
Headers: Authorization: Bearer {token}
```

#### Update Business
```
PATCH /businesses/{id}
Headers: Authorization: Bearer {token}
Body: {
  "name": "Updated Name"
}
```

### Request Types

#### Get Published Request Types (Clients)
```
GET /request-types
Headers: Authorization: Bearer {token}
```

#### Get All Request Types (Admin)
```
GET /admin/request-types
Headers: Authorization: Bearer {token}
```

#### Create Request Type (Admin)
```
POST /admin/request-types
Headers: Authorization: Bearer {token}
Body: {
  "name": "Content Request",
  "description": "...",
  "is_published": true,
  "sla_hours": 72,
  "fields": [
    {
      "field_key": "title",
      "label": "Title",
      "type": "text",
      "required": true,
      "order": 0
    },
    {
      "field_key": "images",
      "label": "Images",
      "type": "image",
      "required": false,
      "options": {
        "multiple": true,
        "max_files": 5,
        "max_size": 4,
        "allowed_types": ["jpg", "png", "webp"]
      },
      "order": 1
    }
  ]
}
```

### Requests

#### Get Requests
```
GET /requests?business_id=1&status=in-progress
Headers: Authorization: Bearer {token}
```

#### Create Request (with file upload)
```
POST /requests
Headers: Authorization: Bearer {token}
Content-Type: multipart/form-data
Body (form-data):
  request_type_id: 1
  business_id: 1
  fields[title]: "My Request"
  fields[images][]: [file1, file2, ...]
```

#### Get Request
```
GET /requests/{id}
Headers: Authorization: Bearer {token}
```

#### Update Request
```
PATCH /requests/{id}
Headers: Authorization: Bearer {token}
Body: {
  "status": "in-progress",
  "assigned_user_id": 2
}
```

### MCP

#### Get Business MCPs
```
GET /businesses/{businessId}/mcps?month=2024-01
Headers: Authorization: Bearer {token}
```

#### Create MCP (Admin)
```
POST /businesses/{businessId}/mcps
Headers: Authorization: Bearer {token}
Body: {
  "month": "2024-01"
}
```

#### Update MCP Post
```
PATCH /mcp-posts/{id}
Headers: Authorization: Bearer {token}
Body: {
  "status": "published",
  "caption": "..."
}
```

### OPMP

#### Get Business OPMP
```
GET /businesses/{businessId}/opmp
Headers: Authorization: Bearer {token}
```

#### Update OPMP (Admin)
```
PATCH /businesses/{businessId}/opmp
Headers: Authorization: Bearer {token}
Body: {
  "data": {...}
}
```

### Teams (Admin)

#### Get Teams
```
GET /admin/teams
Headers: Authorization: Bearer {token}
```

#### Create Team
```
POST /admin/teams
Headers: Authorization: Bearer {token}
Body: {
  "name": "Content Team",
  "description": "..."
}
```

#### Assign Users to Team
```
POST /admin/teams/{id}/assign-users
Headers: Authorization: Bearer {token}
Body: {
  "user_ids": [1, 2, 3]
}
```

### Settings (Admin)

#### Get Settings
```
GET /admin/settings
Headers: Authorization: Bearer {token}
```

#### Update Setting
```
PATCH /admin/settings/{key}
Headers: Authorization: Bearer {token}
Body: {
  "value": "..."
}
```

### Feedback

#### Submit Feedback
```
POST /feedback
Headers: Authorization: Bearer {token}
Body: {
  "subject": "Feedback Subject",
  "category": "bug",
  "message": "...",
  "rating": 5
}
```

### Dashboards

#### Client Dashboard
```
GET /client/dashboard?business_id=1
Headers: Authorization: Bearer {token}
```

#### Admin Dashboard
```
GET /admin/dashboard
Headers: Authorization: Bearer {token}
```

#### Staff Dashboard
```
GET /staff/dashboard
Headers: Authorization: Bearer {token}
```

## Image Upload

When creating a request with image fields:

1. Use `multipart/form-data` content type
2. Send image files as array: `fields[field_key][]`
3. Images are validated based on field configuration
4. URLs are returned in response: `{url: "..."}` or `{urls: [...]}`

Example:
```
POST /requests
Content-Type: multipart/form-data

request_type_id: 1
business_id: 1
fields[title]: "Design Request"
fields[reference_images][]: [file1.jpg]
fields[reference_images][]: [file2.png]
```


