import { ApiProperty } from '@nestjs/swagger';

import { Amenity } from '../../generated/prisma';

export class AmenityEntity implements Amenity {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty({ required: false, nullable: true })
	description!: string | null;

	@ApiProperty({
		description: 'Amenity category',
		example: 'internal',
		enum: ['internal', 'external'],
	})
	category!: string;

	@ApiProperty({
		required: false,
		nullable: true,
		description: 'Icon name for UI display',
		example: 'coffee',
	})
	iconName!: string | null;

	@ApiProperty({
		required: false,
		nullable: true,
		description: 'Image URL for amenity',
		example: '/demo/1.png',
	})
	imageUrl!: string | null;

	@ApiProperty({
		description: 'Whether the amenity is active',
		example: true,
	})
	isActive!: boolean;

	@ApiProperty({
		description: 'Display order for sorting',
		example: 1,
	})
	displayOrder!: number;

	// Audit fields
	@ApiProperty()
	createdAt!: Date;

	@ApiProperty()
	updatedAt!: Date;

	@ApiProperty({ required: false, nullable: true })
	deletedAt!: Date | null;
}
