import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';

import { EOrder } from '../../../../common/constants';
import { PageOptionsDto } from '../../../../common/dto/page-options.dto';
import {
	EnumFieldOptional,
	NumberFieldOptional,
	StringField,
	StringFieldOptional,
} from '../../../../decorators';

export class SceneRequestDto extends OmitType(PageOptionsDto, [
	'orderBy',
	'order',
]) {
	@StringFieldOptional({
		description: 'Query by',
		default: 'order',
	})
	readonly orderBy?: string = 'order';

	@EnumFieldOptional(() => EOrder, { default: EOrder.ASC })
	readonly order: EOrder = EOrder.ASC;
}

export class CreateSceneDto {
	@StringField({ minLength: 1, maxLength: 255, description: 'Scene title' })
	title!: string;

	@StringFieldOptional({ maxLength: 1000, description: 'Scene description' })
	description?: string;

	@NumberFieldOptional({
		int: true,
		min: 1,
		max: 100,
		description: 'Display order of the scene',
	})
	order!: number;

	@StringField({ maxLength: 500, description: 'Panorama image URL' })
	panoramaUrl!: string;

	@StringField({ maxLength: 500, description: 'Thumbnail image URL' })
	thumbnailUrl!: string;

	// Scene positioning (for map integration)
	@NumberFieldOptional({
		min: -1000,
		max: 1000,
		description: 'X position on map',
	})
	mapPositionX?: number;

	@NumberFieldOptional({
		min: -1000,
		max: 1000,
		description: 'Y position on map',
	})
	mapPositionY?: number;

	// Scene settings
	@NumberFieldOptional({
		min: 0,
		max: 360,
		description: 'Initial view angle in degrees',
	})
	initialViewAngle?: number;

	@NumberFieldOptional({ min: 0.1, max: 10, description: 'Maximum zoom level' })
	maxZoom?: number;

	@NumberFieldOptional({ min: 0.1, max: 10, description: 'Minimum zoom level' })
	minZoom?: number;
}

export class UpdateSceneDto extends PartialType(CreateSceneDto) {}

export class BulkCreateSceneDto {
	@ApiProperty({
		description: 'Array of scenes to create',
		type: [CreateSceneDto],
	})
	scenes!: CreateSceneDto[];
}
