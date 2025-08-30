import { ApiProperty } from '@nestjs/swagger';

import { PageMetaDto } from '../../../../common/dto/page-meta.dto';
import { PageDto } from '../../../../common/dto/page.dto';
import { SceneEntity } from '../../../../core/entities/scene.entity';
import {
	DateField,
	NumberFieldOptional,
	StringField,
	StringFieldOptional,
	UUIDField,
} from '../../../../decorators';

export class SceneDto {
	@UUIDField()
	id!: string;

	@StringField()
	title!: string;

	@StringFieldOptional()
	description?: string;

	@NumberFieldOptional()
	order!: number;

	@StringFieldOptional()
	panoramaUrl?: string;

	@StringFieldOptional()
	thumbnailUrl?: string;

	@NumberFieldOptional()
	mapPositionX?: number;

	@NumberFieldOptional()
	mapPositionY?: number;

	@NumberFieldOptional()
	initialViewAngle?: number;

	@NumberFieldOptional()
	maxZoom?: number;

	@NumberFieldOptional()
	minZoom?: number;

	@UUIDField()
	tourId!: string;

	@DateField()
	createdAt!: Date;

	@DateField()
	updatedAt!: Date;

	constructor(scene: SceneEntity) {
		Object.assign(this, scene);
	}
}

export class SceneHotspotDto {
	@UUIDField()
	id!: string;

	@StringField()
	type!: string;

	@StringField()
	title!: string;

	@StringFieldOptional()
	description?: string;

	@NumberFieldOptional()
	positionX!: number;

	@NumberFieldOptional()
	positionY!: number;

	@NumberFieldOptional()
	positionZ!: number;

	@StringFieldOptional()
	iconUrl?: string;

	@StringFieldOptional()
	iconColor?: string;

	@NumberFieldOptional()
	iconSize?: number;

	@StringFieldOptional()
	targetSceneId?: string;

	@StringFieldOptional()
	animationType?: string;

	@NumberFieldOptional()
	animationSpeed?: number;

	@DateField()
	createdAt!: Date;

	@DateField()
	updatedAt!: Date;
}

export class SceneWithHotspotsDto extends SceneDto {
	@ApiProperty({
		description: 'Hotspots in this scene',
		type: [SceneHotspotDto],
	})
	hotspots!: SceneHotspotDto[];

	constructor(scene: SceneEntity, hotspots: SceneHotspotDto[] = []) {
		super(scene);
		this.hotspots = hotspots;
	}
}

export class SceneListResponseDto extends PageDto<SceneDto> {
	constructor(data: SceneDto[], meta: PageMetaDto) {
		super(data, meta);
	}
}

export class BulkSceneResponseDto {
	@ApiProperty({ type: [SceneDto] })
	created!: SceneDto[];

	@ApiProperty()
	summary!: {
		total: number;
		successful: number;
		failed: number;
	};

	constructor(createdScenes: SceneEntity[], total: number, failed: number) {
		this.created = createdScenes.map((scene) => new SceneDto(scene));
		this.summary = {
			total,
			successful: createdScenes.length,
			failed,
		};
	}
}
