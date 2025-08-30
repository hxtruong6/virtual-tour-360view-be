import { ApiProperty } from '@nestjs/swagger';

import { TourAmenity } from '../../generated/prisma';

export class TourAmenityEntity implements TourAmenity {
	@ApiProperty()
	id!: string;

	@ApiProperty({
		description: 'Virtual tour ID',
	})
	tourId!: string;

	@ApiProperty({
		description: 'Amenity ID',
	})
	amenityId!: string;

	@ApiProperty({
		description: 'Whether this amenity is featured for the tour',
		example: false,
	})
	isFeatured!: boolean;

	@ApiProperty()
	createdAt!: Date;
}
