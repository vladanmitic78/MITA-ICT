# API Contracts & Integration Guide

## Frontend Mock Data (to be replaced)
Located in: `/app/frontend/src/mock.js`
- `mockData.services` - Consulting services
- `mockData.saasProducts` - SaaS products
- `mockData.aboutContent` - About page content
- `mockData.contacts` - Contact submissions
- `mockAdmin` - Admin credentials (username: admin, password: admin123)

## Backend Implementation Plan

### 1. Database Models

#### Service Model
```python
{
  "_id": ObjectId,
  "title": str,
  "description": str,
  "icon": str,  # Icon name from lucide-react
  "created_at": datetime,
  "updated_at": datetime
}
```

#### SaaS Product Model
```python
{
  "_id": ObjectId,
  "title": str,
  "description": str,
  "link": str,
  "features": [str],
  "created_at": datetime,
  "updated_at": datetime
}
```

#### Contact Model
```python
{
  "_id": ObjectId,
  "name": str,
  "email": str,
  "phone": str,
  "service": str,
  "comment": str,
  "recaptcha_token": str,
  "created_at": datetime
}
```

#### Admin User Model
```python
{
  "_id": ObjectId,
  "username": str,
  "email": str,
  "password_hash": str,
  "created_at": datetime
}
```

### 2. API Endpoints

#### Public Endpoints
- `GET /api/services` - Get all consulting services
- `GET /api/saas-products` - Get all SaaS products
- `POST /api/contact` - Submit contact form (sends email to info@mitaict.com)

#### Admin Authentication
- `POST /api/admin/login` - Admin login (username/password)
- `POST /api/admin/google-login` - Google OAuth login
- `POST /api/admin/logout` - Logout

#### Protected Admin Endpoints (require JWT token)
- `GET /api/admin/contacts` - Get all contact submissions
- `POST /api/admin/services` - Create new service
- `PUT /api/admin/services/:id` - Update service
- `DELETE /api/admin/services/:id` - Delete service
- `POST /api/admin/saas-products` - Create new SaaS product
- `PUT /api/admin/saas-products/:id` - Update SaaS product
- `DELETE /api/admin/saas-products/:id` - Delete SaaS product

### 3. Frontend Integration Changes

#### Remove mock.js imports and replace with API calls:

**Home.jsx**
- Replace `mockData.services` with API call to `GET /api/services`

**SaasStore.jsx**
- Replace `mockData.saasProducts` with API call to `GET /api/saas-products`

**ContactUs.jsx**
- Replace mock submission with API call to `POST /api/contact`
- Include reCAPTCHA token in request

**AdminLogin.jsx**
- Replace `mockAdmin` check with API call to `POST /api/admin/login`
- Store JWT token in localStorage

**AdminDashboard.jsx**
- Replace all mock data with API calls
- Add JWT token to all requests via Authorization header
- Implement real CRUD operations

### 4. Email Service
- Use SMTP to send emails from contact form
- Recipient: info@mitaict.com
- Email template with form data

### 5. reCAPTCHA Verification
- Site key: 6LdSFPsrAAAAAJIui51XHC_Bvlc6fhLkjzsE6_F3
- Verify token on backend before processing contact form

### 6. Authentication Flow
- JWT-based authentication
- Token expiry: 24 hours
- Store token in localStorage
- Include token in Authorization header for protected routes
