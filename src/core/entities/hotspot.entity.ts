import { ApiProperty } from '@nestjs/swagger';

import { Hotspot, HotspotType, Prisma } from '../../generated/prisma';

export class HotspotEntity implements Hotspot {
	@ApiProperty()
	id!: string;

	@ApiProperty({ enum: HotspotType })
	type!: HotspotType;

	@ApiProperty()
	title!: string;

	@ApiProperty({ required: false, nullable: true })
	description!: string | null;

	// 3D positioning
	@ApiProperty()
	positionX!: number;

	@ApiProperty()
	positionY!: number;

	@ApiProperty()
	positionZ!: number;

	// Visual settings
	@ApiProperty({ required: false, nullable: true })
	iconUrl!: string | null;

	@ApiProperty({ required: false, nullable: true })
	iconColor!: string | null;

	@ApiProperty({ required: false, nullable: true })
	iconSize!: number | null;

	// Content for info hotspots
	@ApiProperty({
		required: false,
		nullable: true,
		example: {
			text: 'This kitchen features granite countertops...',
			image: 'https://cdn.example.com/kitchen_detail.jpg',
		},
	})
	content!: Prisma.JsonValue | null;

	// Navigation settings
	@ApiProperty({ required: false, nullable: true })
	targetSceneId!: string | null;

	// Animation settings
	@ApiProperty({ required: false, nullable: true })
	animationType!: string | null;

	@ApiProperty({ required: false, nullable: true })
	animationSpeed!: number | null;

	// Audit fields
	@ApiProperty()
	createdAt!: Date;

	@ApiProperty()
	updatedAt!: Date;

	@ApiProperty({ required: false, nullable: true })
	deletedAt!: Date | null;

	// Foreign keys
	@ApiProperty()
	sceneId!: string;
}
