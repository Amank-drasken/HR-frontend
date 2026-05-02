# Auto-Login Implementation Guide

## Overview
The auto-login feature allows employees to be automatically logged in without entering credentials. This is useful for scenarios like:
- Company-wide portals with pre-authenticated links
- Mobile apps with token-based redirect flows
- SSO (Single Sign-On) integrations
- Automated login flows after third-party authentication

## How It Works

### Frontend Flow
1. **URL Parameter Method**: Backend redirects to login page with `autoLoginToken` parameter
   ```
   https://hr-frontend.com/login?autoLoginToken=<token>&email=employee@company.com
   ```

2. **Session Storage Method**: Backend stores auto-login data and redirects to login
   ```
   Frontend checks sessionStorage for: 'autoLoginToken' and 'autoLoginEmail'
   ```

3. **Auto-Login Processing**:
   - Frontend detects auto-login token on login page load
   - Shows loading screen while validating token
   - Calls backend `/api/auth/auto-login` endpoint to validate and get user data
   - Automatically redirects to dashboard on success
   - Falls back to manual login form on failure

## Backend Implementation

### 1. Create Auto-Login Endpoint

**Endpoint**: `POST /api/auth/auto-login`

**Request Body**:
```json
{
  "token": "auto_login_token_from_frontend"
}
```

**Response (Success)**:
```json
{
  "access_token": "jwt_token",
  "employee": {
    "id": "emp_123",
    "email": "john.doe@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "EMPLOYEE"
  }
}
```

**Response (Error)**:
```json
{
  "error": "Invalid or expired auto-login token"
}
```

### 2. Generate Auto-Login Token

When you need to auto-login an employee (e.g., after user registration or via SSO):

```javascript
// Example: Backend generates auto-login token
const autoLoginToken = jwt.sign(
  {
    email: employee.email,
    autoLogin: true,
    employeeId: employee.id
  },
  process.env.JWT_SECRET,
  { expiresIn: '24h' } // Short expiry for security
);

// Send to frontend as redirect
return {
  autoLoginLink: `${process.env.FRONTEND_URL}/login?autoLoginToken=${autoLoginToken}&email=${employee.email}`
};
```

### 3. Send Auto-Login Link to Employee

After employee creation/registration:

```javascript
const autoLoginLink = `${process.env.FRONTEND_URL}/login?autoLoginToken=${autoLoginToken}&email=${employee.email}`;

// Send via email
await sendEmail(employee.email, {
  subject: 'Welcome to HR Portal',
  body: `Click here to access your account: ${autoLoginLink}`
});
```

## Usage Scenarios

### Scenario 1: After Employee Creation/Registration
```javascript
// In your employee creation endpoint
const { autoLoginToken, employee } = await createEmployeeAndGenerateToken(data);

return {
  success: true,
  autoLoginLink: `${process.env.FRONTEND_URL}/login?autoLoginToken=${autoLoginToken}&email=${employee.email}`,
  message: 'Employee created successfully. Auto-login link generated.'
};
```

### Scenario 2: Password Reset with Auto-Login
```javascript
// Generate new auto-login token with short expiry
const resetAutoLoginToken = jwt.sign(
  {
    email: user.email,
    autoLogin: true,
    type: 'password_reset'
  },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

const resetLink = `${process.env.FRONTEND_URL}/login?autoLoginToken=${resetAutoLoginToken}&email=${user.email}`;
```

### Scenario 3: SSO Integration
```javascript
// After successful SSO authentication
const ssoAutoLoginToken = jwt.sign(
  {
    email: ssoUser.email,
    autoLogin: true,
    ssoProvider: 'okta'
  },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

return res.redirect(`${process.env.FRONTEND_URL}/login?autoLoginToken=${ssoAutoLoginToken}&email=${ssoUser.email}`);
```

## Security Considerations

1. **Token Expiry**: Always set a short expiry time (1-24 hours)
2. **One-Time Use**: Consider implementing one-time tokens
3. **HTTPS Only**: Always use HTTPS for auto-login links
4. **Token Validation**: Validate token expiry and user status in backend
5. **Rate Limiting**: Implement rate limiting on auto-login endpoint
6. **Audit Trail**: Log all auto-login attempts

## Environment Variables

Add these to your `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Frontend API Integration

The frontend automatically integrates with these endpoints:

1. **POST `/api/auth/login`** - Regular login (already implemented)
2. **POST `/api/auth/auto-login`** - Auto-login token validation (new)

## Error Handling

The auto-login feature handles these scenarios:

- **No auto-login token**: Shows login form
- **Expired token**: Shows login form with error message
- **Invalid token**: Shows login form with error message
- **Server error**: Shows login form with error message
- **Successful auto-login**: Redirects to dashboard

## Testing

### Test Auto-Login with Mock URL
```
http://localhost:3000/login?autoLoginToken=test-token&email=test@company.com
```

### Test Auto-Login Failure
The system will show the regular login form if:
- No auto-login token provided
- Token validation fails
- Backend endpoint returns error

## Debugging

Check browser console for logs:
- `✅ Auto-login successful` - Success
- `❌ Auto-login failed` - Token validation failed
- `🔄 Attempting auto-login...` - Processing
- `ℹ️ No auto-login token found` - No token detected

## Files Modified

- `/src/lib/autoLogin.ts` - Auto-login logic
- `/src/lib/auth.ts` - Updated persistAuthSession export
- `/src/lib/api.ts` - Added autoLogin endpoint
- `/src/hooks/useAutoLogin.ts` - Auto-login hook
- `/src/app/(auth)/login/page.tsx` - Updated login page

## Next Steps

1. Implement `/api/auth/auto-login` endpoint in backend
2. Generate auto-login tokens in your employee creation/registration flow
3. Send auto-login links to employees via email
4. Test the complete flow
