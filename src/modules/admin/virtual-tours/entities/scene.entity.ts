import { ApiProperty } from '@nestjs/swagger';

import { Scene } from '../../../../generated/prisma';

export class SceneEntity implements Scene {
	@ApiProperty()
	id: string;

	@ApiProperty()
	title: string;

	@ApiProperty({ required: false, nullable: true })
	description: string | null;

	@ApiProperty()
	order: number;

	@ApiProperty()
	panorama_url: string;

	@ApiProperty({ required: false, nullable: true })
	thumbnail_url: string | null;

	// Scene positioning (for map integration)
	@ApiProperty({ required: false, nullable: true })
	map_position_x: number | null;

	@ApiProperty({ required: false, nullable: true })
	map_position_y: number | null;

	// Scene settings
	@ApiProperty({ required: false, nullable: true })
	initial_view_angle: number | null;

	@ApiProperty({ required: false, nullable: true })
	max_zoom: number | null;

	@ApiProperty({ required: false, nullable: true })
	min_zoom: number | null;

	// Audit fields
	@ApiProperty()
	created_at: Date;

	@ApiProperty()
	updated_at: Date;

	@ApiProperty({ required: false, nullable: true })
	deleted_at: Date | null;

	// Foreign keys
	@ApiProperty()
	tour_id: string;
}
