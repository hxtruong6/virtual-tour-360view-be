import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '../../../../common/dto/abstract.dto';
import { type PageMetaDto } from '../../../../common/dto/page-meta.dto';
import { PageDto } from '../../../../common/dto/page.dto';
import { IApartmentMetadata } from '../../../../core/types/apartment.types';
import {
	BooleanField,
	DateFieldOptional,
	EnumField,
	EnumFieldOptional,
	NumberField,
	NumberFieldOptional,
	StringField,
	StringFieldOptional,
} from '../../../../decorators';
import {
	Hotspot,
	HotspotType,
	Prisma,
	Scene,
	TourDifficulty,
	TourStatus,
	VirtualTour,
} from '../../../../generated/prisma';
import { TourAmenityDto } from '../../amenities/dto/amenity.response.dto';

export class VirtualTourListResponseDto extends PageDto<VirtualTourDto> {
	constructor(data: VirtualTourDto[], meta: PageMetaDto) {
		super(data, meta);
	}
}

export class VirtualTourDto extends BaseDto {
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

	@StringField({
		description: 'Unique slug for the tour',
		example: 'modern-apartment-virtual-tour',
	})
	readonly slug!: string;

	@EnumField(() => TourStatus, {
		description: 'Tour status',
		example: TourStatus.PUBLISHED,
	})
	readonly status!: TourStatus;

	@EnumFieldOptional(() => TourDifficulty, {
		description: 'Difficulty level',
		example: TourDifficulty.BEGINNER,
	})
	readonly difficulty?: TourDifficulty;

	@StringFieldOptional({
		description: 'Tour category',
		example: 'real-estate',
	})
	readonly category?: string;

	@ApiProperty({
		description: 'Tour tags',
		type: [String],
		example: ['apartment', 'modern', 'luxury'],
	})
	readonly tags!: string[];

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
	})
	readonly metaDescription?: string;

	@ApiProperty({
		description: 'Meta keywords for SEO',
		type: [String],
		example: ['virtual tour', 'apartment', 'real estate'],
	})
	readonly metaKeywords!: string[];

	// Tour settings
	@BooleanField({
		description: 'Allow public access to this tour',
		example: true,
	})
	readonly allowPublicAccess!: boolean;

	@BooleanField({
		description: 'Allow embedding this tour on other websites',
		example: true,
	})
	readonly allowEmbedding!: boolean;

	@BooleanField({
		description: 'Enable autoplay rotation',
		example: false,
	})
	readonly autoplayEnabled!: boolean;

	@NumberFieldOptional({
		description: 'Autoplay speed in seconds per rotation',
		example: 2,
	})
	readonly autoplaySpeed?: number;

	// Statistics
	@NumberField({
		description: 'Total number of views',
		example: 1250,
	})
	readonly viewCount!: number;

	@NumberField({
		description: 'Total number of shares',
		example: 45,
	})
	readonly shareCount!: number;

	@NumberField({
		description: 'Total number of bookmarks',
		example: 89,
	})
	readonly bookmarkCount!: number;

	@NumberFieldOptional({
		description: 'Average rating (1-5 stars)',
		example: 4.8,
	})
	readonly averageRating?: number;

	@NumberField({
		description: 'Total number of ratings',
		example: 25,
	})
	readonly totalRatings!: number;

	// Computed metadata
	@NumberField({
		description: 'Total number of scenes',
		example: 8,
	})
	readonly totalScenes!: number;

	@NumberField({
		description: 'Total number of hotspots',
		example: 15,
	})
	readonly totalHotspots!: number;

	@NumberFieldOptional({
		description: 'Estimated tour duration in minutes',
		example: 12,
	})
	readonly estimatedDuration?: number;

	@ApiProperty({
		required: false,
		nullable: true,
		description: 'Apartment metadata including type and specifications',
		example: {
			type: {
				id: 'studio',
				name: 'Studio',
				unitCount: 1496,
				areaRange: '29.2 - 35 m²',
				description: 'Căn hộ studio hiện đại',
				hasSubLevels: false,
				expectedHotspots: ['Phòng khách', 'Toilet'],
			},
			specifications: {
				bedrooms: 0,
				bathrooms: 1,
				area: 32,
				floor: '15',
				view: 'City View',
				balcony: true,
			},
		},
	})
	readonly apartmentMetadata?: Prisma.JsonValue | null;

	@ApiProperty({
		required: false,
		description: 'Tour amenities',
		type: [TourAmenityDto],
	})
	readonly amenities?: TourAmenityDto[];

	@DateFieldOptional({
		description: 'Publication date',
	})
	readonly publishedAt?: Date;

	// Foreign keys
	@StringField({
		description: 'ID of the user who created this tour',
	})
	readonly createdById!: string;

	@StringFieldOptional({
		description: 'ID of the user who last updated this tour',
	})
	readonly updatedById?: string;

	constructor(data: VirtualTour) {
		super();
		Object.assign(this, data);
	}
}

export class HotspotDto extends BaseDto {
	@EnumField(() => HotspotType, {
		description: 'Hotspot type',
	})
	readonly type!: HotspotType;

	@StringField({
		description: 'Hotspot title',
		example: 'Go to Kitchen',
	})
	readonly title!: string;

	@StringFieldOptional({
		description: 'Hotspot description',
		example: 'Navigate to the modern kitchen',
	})
	readonly description?: string;

	@NumberField({
		description: '3D position X coordinate',
		example: 0.5,
	})
	readonly positionX!: number;

	@NumberField({
		description: '3D position Y coordinate',
		example: 0.3,
	})
	readonly positionY!: number;

	@NumberField({
		description: '3D position Z coordinate',
		example: -0.8,
	})
	readonly positionZ!: number;

	@StringFieldOptional({
		description: 'Icon URL',
		example: 'https://cdn.example.com/arrow_icon.png',
	})
	readonly iconUrl?: string;

	@StringFieldOptional({
		description: 'Icon color',
		example: '#ffffff',
	})
	readonly iconColor?: string;

	@NumberFieldOptional({
		description: 'Icon size',
		example: 1,
	})
	readonly iconSize?: number;

	@ApiProperty({
		description: 'Hotspot content (for info hotspots)',
		required: false,
		example: {
			text: 'This kitchen features granite countertops...',
			image: 'https://cdn.example.com/kitchen_detail.jpg',
		},
	})
	readonly content?: unknown;

	@StringFieldOptional({
		description: 'Target scene ID (for navigation hotspots)',
	})
	readonly targetSceneId?: string;

	@StringFieldOptional({
		description: 'Animation type',
		example: 'pulse',
	})
	readonly animationType?: string;

	@NumberFieldOptional({
		description: 'Animation speed',
		example: 1,
	})
	readonly animationSpeed?: number;

	@StringField({
		description: 'ID of the scene this hotspot belongs to',
	})
	readonly sceneId!: string;

	constructor(data: Hotspot) {
		super();
		Object.assign(this, data);
	}
}

export class SceneDto extends BaseDto {
	@StringField({
		description: 'Scene title',
		example: 'Living Room',
	})
	readonly title!: string;

	@StringFieldOptional({
		description: 'Scene description',
		example: 'Spacious living room with modern furniture',
	})
	readonly description?: string;

	@NumberField({
		description: 'Scene order in the tour',
		example: 1,
	})
	readonly order!: number;

	@StringField({
		description: 'Panorama image URL',
		example: 'https://cdn.example.com/panorama1.jpg',
	})
	readonly panoramaUrl!: string;

	@StringFieldOptional({
		description: 'Scene thumbnail URL',
		example: 'https://cdn.example.com/thumbnail1.jpg',
	})
	readonly thumbnailUrl?: string;

	@NumberFieldOptional({
		description: 'Map position X coordinate',
		example: 100,
	})
	readonly mapPositionX?: number;

	@NumberFieldOptional({
		description: 'Map position Y coordinate',
		example: 150,
	})
	readonly mapPositionY?: number;

	@NumberFieldOptional({
		description: 'Initial view angle in degrees',
		example: 0,
	})
	readonly initialViewAngle?: number;

	@NumberFieldOptional({
		description: 'Maximum zoom level',
		example: 3,
	})
	readonly maxZoom?: number;

	@NumberFieldOptional({
		description: 'Minimum zoom level',
		example: 0.5,
	})
	readonly minZoom?: number;

	@StringField({
		description: 'ID of the tour this scene belongs to',
	})
	readonly tourId!: string;

	@ApiProperty({
		description: 'Scene hotspots',
		type: [HotspotDto],
		required: false,
	})
	readonly hotspots?: HotspotDto[];

	constructor(data: Scene & { hotspots?: Hotspot[] }) {
		super();
		Object.assign(this, data);

		if (data.hotspots) {
			this.hotspots = data.hotspots.map((hotspot) => new HotspotDto(hotspot));
		}
	}
}

export class VirtualTourDetailDto extends VirtualTourDto {
	@ApiProperty({
		description: 'Tour scenes',
		type: [SceneDto],
		required: false,
	})
	readonly scenes?: SceneDto[];

	constructor(
		data: VirtualTour & { scenes?: Array<Scene & { hotspots: Hotspot[] }> },
	) {
		super(data);

		if (data.scenes) {
			this.scenes = data.scenes.map((scene) => new SceneDto(scene));
		}
	}
}
