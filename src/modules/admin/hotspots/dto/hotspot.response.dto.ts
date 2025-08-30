import { ApiProperty } from '@nestjs/swagger';

import { PageMetaDto } from '../../../../common/dto/page-meta.dto';
import { PageDto } from '../../../../common/dto/page.dto';
import { HotspotEntity } from '../../../../core/entities/hotspot.entity';
import {
	DateField,
	NumberField,
	NumberFieldOptional,
	StringField,
	StringFieldOptional,
	UUIDField,
} from '../../../../decorators';
import { HotspotType } from '../../../../generated/prisma';

export class HotspotDto {
	@UUIDField()
	id!: string;

	@ApiProperty({ enum: HotspotType })
	type!: HotspotType;

	@StringField()
	title!: string;

	@StringFieldOptional()
	description?: string;

	// 3D positioning
	@NumberField()
	positionX!: number;

	@NumberField()
	positionY!: number;

	@NumberField()
	positionZ!: number;

	// Visual settings
	@StringFieldOptional()
	iconUrl?: string;

	@StringFieldOptional()
	iconColor?: string;

	@NumberFieldOptional()
	iconSize?: number;

	// Content for info hotspots
	@ApiProperty({
		required: false,
		nullable: true,
		description: 'Flexible content structure',
		example: {
			text: 'Detailed information about this location...',
			image: 'https://example.com/image.jpg',
		},
	})
	content?: Record<string, unknown>;

	// Navigation settings
	@StringFieldOptional()
	targetSceneId?: string;

	// Animation settings
	@StringFieldOptional()
	animationType?: string;

	@NumberFieldOptional()
	animationSpeed?: number;

	@UUIDField()
	sceneId!: string;

	@DateField()
	createdAt!: Date;

	@DateField()
	updatedAt!: Date;

	constructor(hotspot: HotspotEntity) {
		Object.assign(this, hotspot);
	}
}

export class HotspotWithDetailsDto extends HotspotDto {
	@ApiProperty({ description: 'Target scene details for navigation hotspots' })
	targetScene?: {
		id: string;
		title: string;
		thumbnailUrl?: string;
	};

	constructor(
		hotspot: HotspotEntity,
		targetScene?: { id: string; title: string; thumbnailUrl?: string },
	) {
		super(hotspot);
		this.targetScene = targetScene;
	}
}

export class HotspotListResponseDto extends PageDto<HotspotDto> {
	constructor(data: HotspotDto[], meta: PageMetaDto) {
		super(data, meta);
	}
}

export class BulkHotspotResponseDto {
	@ApiProperty({ type: [HotspotDto] })
	created!: HotspotDto[];

	@ApiProperty()
	summary!: {
		total: number;
		successful: number;
		failed: number;
	};

	constructor(createdHotspots: HotspotEntity[], total: number, failed: number) {
		this.created = createdHotspots.map((hotspot) => new HotspotDto(hotspot));
		this.summary = {
			total,
			successful: createdHotspots.length,
			failed,
		};
	}
}
