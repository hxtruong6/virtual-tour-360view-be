import {
	Param,
	ParseUUIDPipe,
	type PipeTransform,
	UseGuards,
	UseInterceptors,
	applyDecorators,
} from '@nestjs/common';
import { type Type } from '@nestjs/common/interfaces';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { AuthGuard } from '../adapters/guards/auth.guard';
import { AuthUserInterceptor } from '../adapters/interceptors/auth-user-interceptor.service';
import { PublicRoute } from './public-route.decorator';

export function Auth({
	// userTypes = [],
	// adminRoles = [],
	// permissions = [],
	options,
}: {
	// userTypes?: EUserType[];
	// adminRoles?: EAdminRoleType[];
	// permissions?: string[];
	options?: Partial<{ public: boolean }>;
} = {}): MethodDecorator {
	const isPublicRoute = options?.public;

	return applyDecorators(
		// UserTypes(userTypes), // Get userTypes from decorator
		// Roles(adminRoles), // Get roles from decorator
		// Permissions(permissions), // Get permissions from decorator
		UseGuards(
			AuthGuard({ public: isPublicRoute }),
			// UserTypeGuard,
			// ...(adminRoles.length > 0 ? [RolesGuard] : []),
			// ...(permissions.length > 0 ? [PermissionsGuard] : []),
		), // Apply guards
		ApiBearerAuth(), // Apply bearer auth
		UseInterceptors(AuthUserInterceptor), // Apply auth user interceptor
		ApiUnauthorizedResponse({ description: 'Unauthorized' }), // Apply unauthorized response
		PublicRoute(isPublicRoute), // Apply public route
	);
}

export function UUIDParam(
	property: string,
	...pipes: Array<Type<PipeTransform> | PipeTransform>
): ParameterDecorator {
	return Param(
		property,
		new ParseUUIDPipe({
			// version: '7',
		}),
		...pipes,
	);
}
