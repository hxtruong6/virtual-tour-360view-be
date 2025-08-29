import { ApiProperty } from '@nestjs/swagger';

import { Scene } from '../../generated/prisma';

export class SceneEntity implements Scene {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	title!: string;

	@ApiProperty({ required: false, nullable: true })
	description!: string | null;

	@ApiProperty()
	order!: number;

	@ApiProperty()
	panoramaUrl!: string;

	@ApiProperty({ required: false, nullable: true })
	thumbnailUrl!: string | null;

	// Scene positioning (for map integration)
	@ApiProperty({ required: false, nullable: true })
	mapPositionX!: number | null;

	@ApiProperty({ required: false, nullable: true })
	mapPositionY!: number | null;

	// Scene settings
	@ApiProperty({ required: false, nullable: true })
	initialViewAngle!: number | null;

	@ApiProperty({ required: false, nullable: true })
	maxZoom!: number | null;

	@ApiProperty({ required: false, nullable: true })
	minZoom!: number | null;

	// Audit fields
	@ApiProperty()
	createdAt!: Date;

	@ApiProperty()
	updatedAt!: Date;

	@ApiProperty({ required: false, nullable: true })
	deletedAt!: Date | null;

	// Foreign keys
	@ApiProperty()
	tourId!: string;
}
