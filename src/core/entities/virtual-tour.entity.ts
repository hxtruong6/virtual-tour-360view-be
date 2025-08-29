import { ApiProperty } from '@nestjs/swagger';

import {
	TourDifficulty,
	TourStatus,
	VirtualTour,
} from '../../generated/prisma';

export class VirtualTourEntity implements VirtualTour {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	title!: string;

	@ApiProperty({ required: false, nullable: true })
	description!: string | null;

	@ApiProperty({ required: false, nullable: true })
	location!: string | null;

	@ApiProperty()
	slug!: string;

	@ApiProperty({ enum: TourStatus })
	status!: TourStatus;

	@ApiProperty({ enum: TourDifficulty, required: false, nullable: true })
	difficulty!: TourDifficulty | null;

	@ApiProperty({ required: false, nullable: true })
	category!: string | null;

	@ApiProperty({ type: [String] })
	tags!: string[];

	@ApiProperty({ required: false, nullable: true })
	thumbnailUrl!: string | null;

	// SEO and metadata
	@ApiProperty({ required: false, nullable: true })
	metaTitle!: string | null;

	@ApiProperty({ required: false, nullable: true })
	metaDescription!: string | null;

	@ApiProperty({ type: [String] })
	metaKeywords!: string[];

	// Tour settings
	@ApiProperty()
	allowPublicAccess!: boolean;

	@ApiProperty()
	allowEmbedding!: boolean;

	@ApiProperty()
	autoplayEnabled!: boolean;

	@ApiProperty({ required: false, nullable: true })
	autoplaySpeed!: number | null;

	// Statistics
	@ApiProperty()
	viewCount!: number;

	@ApiProperty()
	shareCount!: number;

	@ApiProperty()
	bookmarkCount!: number;

	@ApiProperty({ required: false, nullable: true })
	averageRating!: number | null;

	@ApiProperty()
	totalRatings!: number;

	// Computed metadata
	@ApiProperty()
	totalScenes!: number;

	@ApiProperty()
	totalHotspots!: number;

	@ApiProperty({ required: false, nullable: true })
	estimatedDuration!: number | null;

	// Audit fields
	@ApiProperty()
	createdAt!: Date;

	@ApiProperty()
	updatedAt!: Date;

	@ApiProperty({ required: false, nullable: true })
	publishedAt!: Date | null;

	@ApiProperty({ required: false, nullable: true })
	deletedAt!: Date | null;

	// Foreign keys
	@ApiProperty()
	createdById!: string;

	@ApiProperty({ required: false, nullable: true })
	updatedById!: string | null;
}
