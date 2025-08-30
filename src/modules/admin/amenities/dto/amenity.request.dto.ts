import { ApiProperty } from '@nestjs/swagger';
import {
	IsBoolean,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUrl,
	MaxLength,
	Min,
} from 'class-validator';

import { AMENITY_CATEGORIES } from '../../../../core/types/apartment.types';
import {
	BooleanField,
	NumberField,
	StringField,
	StringFieldOptional,
} from '../../../../decorators';

export class CreateAmenityDto {
	@StringField({
		description: 'Amenity name',
		example: 'Elite fitness',
		maxLength: 255,
	})
	readonly name!: string;

	@StringFieldOptional({
		description: 'Amenity description',
		example: 'Phòng gym cao cấp',
	})
	readonly description?: string;

	@ApiProperty({
		description: 'Amenity category',
		enum: Object.values(AMENITY_CATEGORIES),
		example: AMENITY_CATEGORIES.INTERNAL,
	})
	@IsEnum(AMENITY_CATEGORIES)
	@IsNotEmpty()
	readonly category!: string;

	@StringFieldOptional({
		description: 'Icon name for UI display',
		example: 'dumbbell',
		maxLength: 100,
	})
	readonly iconName?: string;

	@ApiProperty({
		required: false,
		description: 'Image URL for amenity',
		example: '/demo/5.png',
	})
	@IsOptional()
	@IsUrl()
	readonly imageUrl?: string;

	@BooleanField({
		description: 'Whether the amenity is active',
		example: true,
		default: true,
	})
	readonly isActive?: boolean = true;

	@NumberField({
		description: 'Display order for sorting',
		example: 1,
		minimum: 0,
		default: 0,
	})
	readonly displayOrder?: number = 0;
}

export class UpdateAmenityDto {
	@StringFieldOptional({
		description: 'Amenity name',
		example: 'Elite fitness',
		maxLength: 255,
	})
	readonly name?: string;

	@StringFieldOptional({
		description: 'Amenity description',
		example: 'Phòng gym cao cấp',
	})
	readonly description?: string;

	@ApiProperty({
		required: false,
		description: 'Amenity category',
		enum: Object.values(AMENITY_CATEGORIES),
		example: AMENITY_CATEGORIES.INTERNAL,
	})
	@IsOptional()
	@IsEnum(AMENITY_CATEGORIES)
	readonly category?: string;

	@StringFieldOptional({
		description: 'Icon name for UI display',
		example: 'dumbbell',
		maxLength: 100,
	})
	readonly iconName?: string;

	@ApiProperty({
		required: false,
		description: 'Image URL for amenity',
		example: '/demo/5.png',
	})
	@IsOptional()
	@IsUrl()
	readonly imageUrl?: string;

	@BooleanField({
		required: false,
		description: 'Whether the amenity is active',
		example: true,
	})
	readonly isActive?: boolean;

	@NumberField({
		required: false,
		description: 'Display order for sorting',
		example: 1,
		minimum: 0,
	})
	readonly displayOrder?: number;
}

export class AssignAmenityToTourDto {
	@ApiProperty({
		description: 'Array of amenity IDs to assign to the tour',
		type: [String],
		example: ['amenity-id-1', 'amenity-id-2'],
	})
	@IsString({ each: true })
	@IsNotEmpty({ each: true })
	readonly amenityIds!: string[];

	@ApiProperty({
		required: false,
		description: 'Array of amenity IDs that should be featured',
		type: [String],
		example: ['amenity-id-1'],
	})
	@IsOptional()
	@IsString({ each: true })
	readonly featuredAmenityIds?: string[];
}
