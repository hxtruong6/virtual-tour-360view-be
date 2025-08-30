import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';

import { EOrder } from '../../../../common/constants';
import { PageOptionsDto } from '../../../../common/dto/page-options.dto';
import {
	EnumFieldOptional,
	NumberField,
	NumberFieldOptional,
	StringField,
	StringFieldOptional,
} from '../../../../decorators';
import { HotspotType } from '../../../../generated/prisma';

export class HotspotRequestDto extends OmitType(PageOptionsDto, [
	'orderBy',
	'order',
]) {
	@StringFieldOptional({
		description: 'Query by',
		default: 'title',
	})
	readonly orderBy?: string = 'title';

	@EnumFieldOptional(() => EOrder, { default: EOrder.ASC })
	readonly order: EOrder = EOrder.ASC;
}

export class CreateHotspotDto {
	@EnumFieldOptional(() => HotspotType, {
		description: 'Type of hotspot',
		default: HotspotType.INFO,
	})
	type!: HotspotType;

	@StringField({ minLength: 1, maxLength: 255, description: 'Hotspot title' })
	title!: string;

	@StringFieldOptional({ maxLength: 1000, description: 'Hotspot description' })
	description?: string;

	// 3D positioning (required)
	@NumberField({
		min: -1000,
		max: 1000,
		description: 'X position in 3D space',
	})
	positionX!: number;

	@NumberField({
		min: -1000,
		max: 1000,
		description: 'Y position in 3D space',
	})
	positionY!: number;

	@NumberField({
		min: -1000,
		max: 1000,
		description: 'Z position in 3D space',
	})
	positionZ!: number;

	// Visual settings (optional)
	@StringFieldOptional({ maxLength: 500, description: 'Icon URL' })
	iconUrl?: string;

	@StringFieldOptional({
		description: 'Icon color in hex format',
		example: '#ffffff',
	})
	iconColor?: string;

	@NumberFieldOptional({
		min: 0.1,
		max: 5,
		description: 'Icon size multiplier',
	})
	iconSize?: number;

	// Content for info hotspots (JSON)
	@ApiProperty({
		required: false,
		description: 'Flexible content structure for info hotspots',
		example: {
			text: 'This is a detailed description of this area...',
			image: 'https://example.com/detail.jpg',
			video: 'https://example.com/video.mp4',
		},
	})
	content?: Record<string, unknown>;

	// Navigation settings
	@StringFieldOptional({
		description: 'Target scene ID for navigation hotspots',
	})
	targetSceneId?: string;

	// Animation settings
	@StringFieldOptional({
		description: 'Animation type',
		default: 'pulse',
		example: 'pulse',
	})
	animationType?: string;

	@NumberFieldOptional({
		min: 0.1,
		max: 5,
		description: 'Animation speed multiplier',
		default: 1,
	})
	animationSpeed?: number;
}

export class UpdateHotspotDto extends PartialType(CreateHotspotDto) {}

export class BulkCreateHotspotDto {
	@ApiProperty({
		description: 'Array of hotspots to create',
		type: [CreateHotspotDto],
	})
	hotspots!: CreateHotspotDto[];
}
