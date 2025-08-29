import { UseGuards, UseInterceptors, applyDecorators } from '@nestjs/common';

import { GrpcAuthGuard } from '../adapters/guards/grpc-auth.guard';
import { GrpcAuthUserInterceptor } from '../adapters/interceptors/grpc-auth-user-interceptor.service';

/**
 * Decorator to enable gRPC authentication for a method
 * This will validate JWT tokens and set user context
 */
export function GrpcAuth(): MethodDecorator {
	return applyDecorators(
		UseGuards(GrpcAuthGuard), // Validate token
		UseInterceptors(GrpcAuthUserInterceptor), // Set user context
	);
}

/**
 * Decorator to mark a gRPC method as public (no authentication required)
 */
export function GrpcPublic(): MethodDecorator {
	return applyDecorators();
	// No guard or interceptor needed for public routes
}
