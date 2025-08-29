import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

import { PageOptionsDto } from '../../../../common/dto/page-options.dto';
import {
	BooleanFieldOptional,
	EnumFieldOptional,
	NumberFieldOptional,
	StringField,
	StringFieldOptional,
} from '../../../../decorators';
import { TourDifficulty, TourStatus } from '../../../../generated/prisma';

export class VirtualTourRequestDto extends PageOptionsDto {
	@StringFieldOptional({
		description: 'Search by title or description',
	})
	readonly search?: string;

	@EnumFieldOptional(() => TourStatus, {
		description: 'Filter by tour status',
	})
	readonly status?: TourStatus;

	@StringFieldOptional({
		description: 'Filter by category',
	})
	readonly category?: string;

	@EnumFieldOptional(() => TourDifficulty, {
		description: 'Filter by difficulty level',
	})
	readonly difficulty?: TourDifficulty;

	@ApiPropertyOptional({
		description: 'Filter by tags',
		type: [String],
		example: ['apartment', 'modern'],
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	readonly tags?: string[];

	@StringFieldOptional({
		description: 'Filter by location',
	})
	readonly location?: string;

	@StringFieldOptional({
		description: 'Filter by creator user ID',
	})
	readonly createdById?: string;
}

export class CreateVirtualTourDto {
	@StringField({
		description: 'Tour title',
		example: 'Modern Apartment Virtual Tour',
	})
	readonly title!: string;

	@StringFieldOptional({
		description: 'Tour description',
		example: 'Experience this beautiful modern apartment in downtown',
	})
	readonly description?: string;

	@StringFieldOptional({
		description: 'Tour location',
		example: 'New York, NY',
	})
	readonly location?: string;

	@StringFieldOptional({
		description: 'Tour category',
		example: 'real-estate',
	})
	readonly category?: string;

	@EnumFieldOptional(() => TourDifficulty, {
		description: 'Difficulty level',
		example: TourDifficulty.BEGINNER,
	})
	readonly difficulty?: TourDifficulty;

	@ApiPropertyOptional({
		description: 'Tour tags',
		type: [String],
		example: ['apartment', 'modern', 'luxury'],
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	readonly tags?: string[];

	@StringFieldOptional({
		description: 'Thumbnail URL',
		example: 'https://cdn.example.com/thumbnail.jpg',
	})
	readonly thumbnailUrl?: string;

	// SEO fields
	@StringFieldOptional({
		description: 'Meta title for SEO',
		example: 'Modern Apartment Virtual Tour | Real Estate',
	})
	readonly metaTitle?: string;

	@StringFieldOptional({
		description: 'Meta description for SEO',
		example:
			'Experience this beautiful modern apartment through our immersive virtual tour',
	})
	readonly metaDescription?: string;

	@ApiPropertyOptional({
		description: 'Meta keywords for SEO',
		type: [String],
		example: ['virtual tour', 'apartment', 'real estate'],
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	readonly metaKeywords?: string[];

	// Tour settings
	@BooleanFieldOptional({
		description: 'Allow public access to this tour',
		example: true,
	})
	readonly allowPublicAccess?: boolean;

	@BooleanFieldOptional({
		description: 'Allow embedding this tour on other websites',
		example: true,
	})
	readonly allowEmbedding?: boolean;

	@BooleanFieldOptional({
		description: 'Enable autoplay rotation',
		example: false,
	})
	readonly autoplayEnabled?: boolean;

	@NumberFieldOptional({
		description: 'Autoplay speed in seconds per rotation',
		example: 2,
		min: 1,
		max: 10,
	})
	readonly autoplaySpeed?: number;

	@NumberFieldOptional({
		description: 'Estimated tour duration in minutes',
		example: 15,
		min: 1,
		max: 120,
	})
	readonly estimatedDuration?: number;
}

export class UpdateVirtualTourDto {
	@StringFieldOptional({
		description: 'Tour title',
		example: 'Updated Modern Apartment Virtual Tour',
	})
	readonly title?: string;

	@StringFieldOptional({
		description: 'Tour description',
	})
	readonly description?: string;

	@StringFieldOptional({
		description: 'Tour location',
	})
	readonly location?: string;

	@EnumFieldOptional(() => TourStatus, {
		description: 'Tour status',
		example: TourStatus.PUBLISHED,
	})
	readonly status?: TourStatus;

	@StringFieldOptional({
		description: 'Tour category',
	})
	readonly category?: string;

	@EnumFieldOptional(() => TourDifficulty, {
		description: 'Difficulty level',
	})
	readonly difficulty?: TourDifficulty;

	@ApiPropertyOptional({
		description: 'Tour tags',
		type: [String],
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	readonly tags?: string[];

	@StringFieldOptional({
		description: 'Thumbnail URL',
	})
	readonly thumbnailUrl?: string;

	// SEO fields
	@StringFieldOptional({
		description: 'Meta title for SEO',
	})
	readonly metaTitle?: string;

	@StringFieldOptional({
		description: 'Meta description for SEO',
	})
	readonly metaDescription?: string;

	@ApiPropertyOptional({
		description: 'Meta keywords for SEO',
		type: [String],
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	readonly metaKeywords?: string[];

	// Tour settings
	@BooleanFieldOptional({
		description: 'Allow public access to this tour',
	})
	readonly allowPublicAccess?: boolean;

	@BooleanFieldOptional({
		description: 'Allow embedding this tour on other websites',
	})
	readonly allowEmbedding?: boolean;

	@BooleanFieldOptional({
		description: 'Enable autoplay rotation',
	})
	readonly autoplayEnabled?: boolean;

	@NumberFieldOptional({
		description: 'Autoplay speed in seconds per rotation',
		min: 1,
		max: 10,
	})
	readonly autoplaySpeed?: number;

	@NumberFieldOptional({
		description: 'Estimated tour duration in minutes',
		min: 1,
		max: 120,
	})
	readonly estimatedDuration?: number;
}
