# Debug Steps for 403 Forbidden Error

## Frontend Debugging (Already Implemented)

1. **Check Console Logs**: Run the application and check what's logged:
   - Current user information
   - JWT token being sent
   - Headers being sent
   - Full URL being called

2. **Authentication Test**: The app will now test authentication with the profile endpoint first.

## Backend Checks Needed

### 1. **Check JWT Token Validation**
In your backend, verify:
```java
// Check if your JWT filter is working correctly
// Look for logs like: "JWT token is valid" or "Invalid JWT token"
```

### 2. **Check Endpoint Security Configuration**
```java
// In your SecurityConfig or similar:
.requestMatchers("/candidatures/stagiaire/**").hasRole("STAGIAIRE")
// or
.requestMatchers("/candidatures/stagiaire/**").authenticated()
```

### 3. **Check User ID Matching**
Your backend might be checking if the user ID in the URL matches the JWT subject:
```java
// In your controller:
@GetMapping("/candidatures/stagiaire/{id}")
public ResponseEntity<...> getCandidatures(@PathVariable Long id, Authentication auth) {
    // Check if the id matches the authenticated user's ID
    String authenticatedUserId = auth.getName(); // or however you extract it
    if (!id.equals(Long.valueOf(authenticatedUserId))) {
        throw new AccessDeniedException("Unauthorized");
    }
    // ...
}
```

### 4. **Check CORS Configuration**
```java
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
// or in your CORS configuration
```

### 5. **Check JWT Claims**
Verify that your JWT contains the correct claims:
```java
// Your generateToken method should include:
.claim("userId", user.getId())
.claim("role", user.getRole())
.setSubject(user.getEmail())
```

## Quick Backend Test

Create a simple test endpoint to verify JWT:
```java
@GetMapping("/test/auth")
public ResponseEntity<Map<String, Object>> testAuth(Authentication auth) {
    Map<String, Object> response = new HashMap<>();
    response.put("authenticated", auth.isAuthenticated());
    response.put("principal", auth.getPrincipal());
    response.put("authorities", auth.getAuthorities());
    return ResponseEntity.ok(response);
}
```

## Network Analysis

1. **Open Browser DevTools**
2. **Go to Network tab**
3. **Reload the candidatures page**
4. **Check the request headers and response**

Look for:
- Authorization header format
- Response headers (CORS headers)
- Exact error message from backend

## Common Fixes

### If JWT is not being accepted:
1. Check if backend expects "Authorization: Bearer <token>" format
2. Verify JWT secret key is the same for generation and validation
3. Check token expiration

### If CORS is the issue:
1. Add proper CORS configuration in backend
2. Allow credentials in CORS
3. Include proper allowed headers

### If user authorization fails:
1. Ensure user ID in JWT matches the requested resource
2. Check role-based access control
3. Verify user exists and is active
