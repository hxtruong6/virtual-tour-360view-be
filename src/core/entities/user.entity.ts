import { ApiProperty } from '@nestjs/swagger';

import { User, UserRole, UserStatus } from '../../generated/prisma';

export class UserEntity implements User {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	email!: string;

	@ApiProperty()
	username!: string | null;

	@ApiProperty()
	firstName!: string | null;

	@ApiProperty()
	lastName!: string | null;

	@ApiProperty()
	avatar!: string | null;

	@ApiProperty()
	role!: UserRole;

	@ApiProperty()
	status!: UserStatus;

	@ApiProperty()
	language!: string;

	@ApiProperty()
	timezone!: string;

	@ApiProperty()
	hashedPassword!: string | null;

	@ApiProperty()
	emailVerifiedAt!: Date | null;

	@ApiProperty()
	lastLoginAt!: Date | null;

	@ApiProperty()
	passwordResetToken!: string | null;

	@ApiProperty()
	passwordResetExpiresAt!: Date | null;

	@ApiProperty()
	createdAt!: Date;

	@ApiProperty()
	updatedAt!: Date;

	@ApiProperty()
	deletedAt!: Date | null;
}
