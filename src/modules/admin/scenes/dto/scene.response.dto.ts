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

interface IHotspot {
	id: string;
	type: string;
	title: string;
	// Add more fields as needed when hotspot DTOs are created
}

export class SceneWithHotspotsDto extends SceneDto {
	@ApiProperty({ description: 'Hotspots in this scene', type: [Object] })
	hotspots!: IHotspot[]; // Will be properly typed when hotspot DTOs are created

	constructor(scene: SceneEntity, hotspots: IHotspot[] = []) {
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
