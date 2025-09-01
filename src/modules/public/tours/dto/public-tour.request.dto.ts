import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

import { PageOptionsDto } from '../../../../common/dto/page-options.dto';
import { EnumFieldOptional, StringFieldOptional } from '../../../../decorators';
import { TourDifficulty } from '../../../../generated/prisma';

export class PublicTourRequestDto extends PageOptionsDto {
	@StringFieldOptional({
		description: 'Search by title or description',
	})
	readonly search?: string;

	@StringFieldOptional({
		description: 'Filter by category',
	})
	readonly category?: string;

	@StringFieldOptional({
		description: 'Filter by apartment type',
		example: 'studio',
	})
	readonly apartmentType?: string;

	@ApiPropertyOptional({
		description: 'Filter by amenities (comma-separated IDs)',
		type: [String],
		example: ['amenity-id-1', 'amenity-id-2'],
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	readonly amenities?: string[];

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
}
