import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '../../../../common/dto/abstract.dto';
import { PageMetaDto } from '../../../../common/dto/page-meta.dto';
import { PageDto } from '../../../../common/dto/page.dto';
import { AmenityEntity, TourAmenityEntity } from '../../../../core/entities';
import {
	BooleanField,
	NumberField,
	StringField,
	StringFieldOptional,
} from '../../../../decorators';

export class AmenityDto extends BaseDto {
	@StringField({
		description: 'Amenity name',
		example: 'Elite fitness',
	})
	readonly name!: string;

	@StringFieldOptional({
		description: 'Amenity description',
		example: 'Phòng gym cao cấp',
	})
	readonly description?: string;

	@StringField({
		description: 'Amenity category',
		example: 'internal',
	})
	readonly category!: string;

	@StringFieldOptional({
		description: 'Icon name for UI display',
		example: 'dumbbell',
	})
	readonly iconName?: string;

	@StringFieldOptional({
		description: 'Image URL for amenity',
		example: '/demo/5.png',
	})
	readonly imageUrl?: string;

	@BooleanField({
		description: 'Whether the amenity is active',
		example: true,
	})
	readonly isActive!: boolean;

	@NumberField({
		description: 'Display order for sorting',
		example: 1,
	})
	readonly displayOrder!: number;

	constructor(amenity: AmenityEntity) {
		super();

		Object.assign(this, amenity);
	}
}

export class AmenityListResponseDto extends PageDto<AmenityDto> {
	@ApiProperty({
		description: 'List of amenities',
		type: [AmenityDto],
	})
	readonly data: AmenityDto[] = [];

	constructor(data: AmenityDto[], meta: PageMetaDto) {
		super(data, meta);
	}
}

export class TourAmenityDto {
	@StringField({
		description: 'Amenity ID',
	})
	readonly id!: string;

	@StringField({
		description: 'Amenity name',
		example: 'Elite fitness',
	})
	readonly name!: string;

	@StringFieldOptional({
		description: 'Amenity description',
		example: 'Phòng gym cao cấp',
	})
	readonly description?: string;

	@StringField({
		description: 'Amenity category',
		example: 'internal',
	})
	readonly category!: string;

	@StringFieldOptional({
		description: 'Icon name for UI display',
		example: 'dumbbell',
	})
	readonly iconName?: string;

	@StringFieldOptional({
		description: 'Image URL for amenity',
		example: '/demo/5.png',
	})
	readonly imageUrl?: string;

	@BooleanField({
		description: 'Whether this amenity is featured for the tour',
		example: false,
	})
	readonly isFeatured!: boolean;

	@NumberField({
		description: 'Display order for sorting',
		example: 1,
	})
	readonly displayOrder!: number;

	constructor(tourAmenity: TourAmenityEntity) {
		Object.assign(this, tourAmenity);
	}
}
