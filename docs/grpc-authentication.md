# gRPC Authentication with Bearer Tokens

This document explains how to implement and use gRPC authentication with JWT bearer tokens in the CWGame backend service.

## Overview

The gRPC authentication system uses JWT bearer tokens passed through gRPC metadata. It provides:

- **Token-based authentication** using JWT tokens
- **Metadata extraction** from gRPC calls
- **User context injection** for authenticated requests
- **Public/private route support** with decorators
- **Proper error handling** with gRPC status codes

## Architecture

### Components

1. **GrpcJwtStrategy** - Passport strategy for JWT validation in gRPC context
2. **GrpcAuthUserInterceptor** - Interceptor that handles authentication logic
3. **GrpcAuth/GrpcPublic Decorators** - Decorators to mark routes as protected or public
4. **GrpcException** - Custom exception handling for gRPC errors

| Component | Purpose | Responsibility | Execution Order |
|-----------|---------|----------------|-----------------|
| **Guard** | Authentication | Token validation & verification | 1st |
| **Interceptor** | Context Setting | User fetching & context injection | 2nd |

### 1. GrpcAuthGuard (Authentication)

```typescript
@Injectable()
export class GrpcAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Check if route is public
    // 2. Extract token from metadata
    // 3. Validate JWT token
    // 4. Store payload in context
    // 5. Return true/false
  }
}
```

**Responsibilities:**

- ✅ Extract token from gRPC metadata
- ✅ Validate JWT signature and expiration
- ✅ Check token type (ACCESS_TOKEN vs REFRESH_TOKEN)
- ✅ Store validated payload in request context
- ❌ **NOT** responsible for user database lookup
- ❌ **NOT** responsible for setting user context

### 2. GrpcAuthUserInterceptor (Context Setting)

```typescript
@Injectable()
export class GrpcAuthUserInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    // 1. Extract token from metadata
    // 2. Validate JWT token
    // 3. Fetch user from database
    // 4. Set user context in request
    // 5. Proceed to handler
  }
}
```

**Responsibilities:**

- ✅ Extract token from metadata
- ✅ Validate JWT token
- ✅ Fetch user from database
- ✅ Set user context in request
- ❌ **NOT** responsible for token validation
- ❌ **NOT** responsible for user database lookup

### Flow

1. Client sends gRPC request with JWT token in metadata
2. `GrpcAuthUserInterceptor` extracts token from metadata
3. JWT is validated and user is fetched from database
4. User context is set for the request
5. Request proceeds to handler method

## Implementation

### 1. Authentication Decorators

Use these decorators to mark your gRPC methods:

```typescript
import { GrpcAuth, GrpcPublic } from '../../decorators/grpc-auth.decorator';

@GrpcMethod(EGrpcService.CW_GAME_SERVICE, EGrpcMethod.SOME_METHOD)
@GrpcAuth() // Requires authentication
async protectedMethod(data: SomeRequest): Promise<SomeResponse> {
  // This method requires a valid JWT token
}

@GrpcMethod(EGrpcService.CW_GAME_SERVICE, EGrpcMethod.PUBLIC_METHOD)
@GrpcPublic() // No authentication required
async publicMethod(data: SomeRequest): Promise<SomeResponse> {
  // This method is public
}
```

### 2. Client Usage

Clients should include the JWT token in gRPC metadata:

```typescript
// JavaScript/TypeScript client example
import { Metadata } from '@grpc/grpc-js';

const metadata = new Metadata();
metadata.add('authorization', `Bearer ${jwtToken}`);

// Make gRPC call with metadata
client.someMethod(request, metadata, (error, response) => {
  // Handle response
});
```

```python
# Python client example
import grpc

metadata = [('authorization', f'Bearer {jwt_token}')]

# Make gRPC call with metadata
response = stub.some_method(request, metadata=metadata)
```

```go
// Go client example
import (
    "google.golang.org/grpc"
    "google.golang.org/grpc/metadata"
)

md := metadata.Pairs("authorization", "Bearer "+jwtToken)
ctx := metadata.NewOutgoingContext(context.Background(), md)

// Make gRPC call with context
response, err := client.SomeMethod(ctx, request)
```

### 3. Error Handling

The system provides proper gRPC error responses:

- **UNAUTHENTICATED (16)** - Invalid or missing token
- **PERMISSION_DENIED (7)** - Valid token but insufficient permissions
- **INTERNAL (13)** - Server errors

### 4. User Context Access

In your gRPC methods, you can access the authenticated user:

```typescript
import { ContextProvider } from '../../common/providers';

@GrpcMethod(EGrpcService.CW_GAME_SERVICE, EGrpcMethod.SOME_METHOD)
@GrpcAuth()
async someMethod(data: SomeRequest): Promise<SomeResponse> {
  const user = ContextProvider.getAuthUser();
  
  // Use user information
  console.log(`Request from user: ${user.id}`);
  
  // Your business logic here
}
```

## Security Considerations

### 1. Token Validation

- Tokens are validated for expiration
- Token type is verified (ACCESS_TOKEN vs REFRESH_TOKEN)
- User existence and active status are checked

### 2. Error Information

- Generic error messages to prevent information leakage
- Detailed logging for debugging (server-side only)
- Proper gRPC status codes for client handling

### 3. Token Storage

- Tokens should be stored securely on the client side
- Use secure storage mechanisms (e.g., secure cookies, encrypted storage)
- Implement token refresh mechanisms

## Configuration

### Environment Variables

Ensure these are configured in your environment:

```env
# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRATION_TIME=15m
JWT_REFRESH_TOKEN_EXPIRATION_TIME=7d
```

### Module Setup

The authentication components are automatically registered in `AuthModule`:

```typescript
@Global()
@Module({
  providers: [
    // ... other providers
    GrpcJwtStrategy,
    GrpcAuthUserInterceptor,
  ],
  exports: [JwtModule, AuthService, GrpcAuthUserInterceptor],
})
export class AuthModule {}
```

## Testing

### Unit Tests

Test your authentication logic:

```typescript
describe('GrpcAuthUserInterceptor', () => {
  it('should authenticate valid JWT token', async () => {
    // Test implementation
  });

  it('should reject invalid token', async () => {
    // Test implementation
  });

  it('should allow public routes', async () => {
    // Test implementation
  });
});
```

### Integration Tests

Test with actual gRPC calls:

```typescript
describe('gRPC Authentication', () => {
  it('should require authentication for protected methods', async () => {
    // Test without token
    // Should return UNAUTHENTICATED
  });

  it('should accept valid token for protected methods', async () => {
    // Test with valid token
    // Should succeed
  });
});
```

## Best Practices

### 1. Token Management

- Use short-lived access tokens (15-30 minutes)
- Implement refresh token rotation
- Store refresh tokens securely
- Implement token blacklisting for logout

### 2. Error Handling

- Always use proper gRPC status codes
- Log authentication failures for monitoring
- Don't expose sensitive information in error messages

### 3. Performance

- Consider caching user information for frequently accessed data
- Use efficient database queries for user lookups
- Monitor authentication performance metrics

### 4. Monitoring

- Log authentication attempts (success/failure)
- Monitor token expiration patterns
- Track authentication performance metrics
- Set up alerts for unusual authentication patterns

## Troubleshooting

### Common Issues

1. **"No authentication metadata provided"**
   - Ensure client is sending metadata with authorization header
   - Check that metadata key is exactly "authorization"

2. **"Invalid authorization header format"**
   - Ensure token starts with "Bearer "
   - Check for extra spaces or characters

3. **"Invalid or expired token"**
   - Verify token hasn't expired
   - Check JWT secret configuration
   - Ensure token type is ACCESS_TOKEN

4. **"User not found"**
   - Verify user exists in database
   - Check user is active
   - Ensure user ID in token matches database

### Debug Mode

Enable debug logging by setting log level:

```typescript
// In your logger configuration
const logger = new Logger('GrpcAuthUserInterceptor');
logger.setLogLevels(['debug']);
```

## Migration from HTTP Authentication

If migrating from HTTP authentication:

1. Update client code to use gRPC metadata
2. Replace HTTP guards with gRPC decorators
3. Update error handling to use gRPC status codes
4. Test all authentication flows thoroughly

## Examples

### Complete Controller Example

```typescript
@Controller({ path: 'example', version: '1' })
export class ExampleController {
  
  @GrpcMethod(EGrpcService.CW_GAME_SERVICE, 'PublicMethod')
  @GrpcPublic()
  async publicMethod(data: PublicRequest): Promise<PublicResponse> {
    return { message: 'This is public' };
  }

  @GrpcMethod(EGrpcService.CW_GAME_SERVICE, 'ProtectedMethod')
  @GrpcAuth()
  async protectedMethod(data: ProtectedRequest): Promise<ProtectedResponse> {
    const user = ContextProvider.getAuthUser();
    return { 
      message: `Hello ${user.username}`,
      userId: user.id 
    };
  }
}
```

This implementation provides a robust, secure, and scalable gRPC authentication system that follows NestJS best practices and gRPC conventions.
