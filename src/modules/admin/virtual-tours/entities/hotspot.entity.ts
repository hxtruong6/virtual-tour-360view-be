import { ApiProperty } from '@nestjs/swagger';

import { Hotspot, HotspotType, Prisma } from '../../../../generated/prisma';

export class HotspotEntity implements Hotspot {
	@ApiProperty()
	id: string;

	@ApiProperty({ enum: HotspotType })
	type: HotspotType;

	@ApiProperty()
	title: string;

	@ApiProperty({ required: false, nullable: true })
	description: string | null;

	// 3D positioning
	@ApiProperty()
	position_x: number;

	@ApiProperty()
	position_y: number;

	@ApiProperty()
	position_z: number;

	// Visual settings
	@ApiProperty({ required: false, nullable: true })
	icon_url: string | null;

	@ApiProperty({ required: false, nullable: true })
	icon_color: string | null;

	@ApiProperty({ required: false, nullable: true })
	icon_size: number | null;

	// Content for info hotspots
	@ApiProperty({
		required: false,
		nullable: true,
		example: {
			text: 'This kitchen features granite countertops...',
			image: 'https://cdn.example.com/kitchen_detail.jpg',
		},
	})
	content: Prisma.JsonValue | null;

	// Navigation settings
	@ApiProperty({ required: false, nullable: true })
	target_scene_id: string | null;

	// Animation settings
	@ApiProperty({ required: false, nullable: true })
	animation_type: string | null;

	@ApiProperty({ required: false, nullable: true })
	animation_speed: number | null;

	// Audit fields
	@ApiProperty()
	created_at: Date;

	@ApiProperty()
	updated_at: Date;

	@ApiProperty({ required: false, nullable: true })
	deleted_at: Date | null;

	// Foreign keys
	@ApiProperty()
	scene_id: string;
}
