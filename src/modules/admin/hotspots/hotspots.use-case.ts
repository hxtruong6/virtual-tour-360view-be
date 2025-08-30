import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

import {
	EOrder,
	HOTSPOT_ORDER_BY,
	HOTSPOT_QUERY_BY,
} from '../../../common/constants';
import { PageMetaDto } from '../../../common/dto/page-meta.dto';
import { getPagination } from '../../../common/utils';
import { HotspotEntity } from '../../../core/entities/hotspot.entity';
import { Prisma } from '../../../generated/prisma';
import { PrismaService } from '../../../prisma/prisma.service';
import {
	BulkCreateHotspotDto,
	CreateHotspotDto,
	HotspotRequestDto,
	UpdateHotspotDto,
} from './dto/hotspot.request.dto';
import {
	BulkHotspotResponseDto,
	HotspotDto,
	HotspotListResponseDto,
	HotspotWithDetailsDto,
} from './dto/hotspot.response.dto';

@Injectable()
export class HotspotsUseCase {
	private static readonly sceneNotFound = 'Scene not found';

	private static readonly hotspotNotFound = 'Hotspot not found';

	private static readonly virtualTourNotFound = 'Virtual tour not found';

	constructor(private readonly prisma: PrismaService) {}

	async getHotspotsBySceneId(
		tourId: string,
		sceneId: string,
		query: HotspotRequestDto,
	): Promise<HotspotListResponseDto> {
		const { page, pageSize, q, qBy, order, orderBy } = query;

		const pagi = getPagination({ page, pageSize });

		// Verify tour and scene exist
		await this.verifyTourAndScene(tourId, sceneId);

		// Build where clause
		const where: Prisma.HotspotWhereInput = {
			sceneId,
			deletedAt: null,
		};

		if (q && qBy && HOTSPOT_QUERY_BY[qBy]) {
			where[HOTSPOT_QUERY_BY[qBy]] = {
				contains: q,
				mode: 'insensitive',
			};
		}

		// Build order by
		const orderByQuery: Prisma.HotspotOrderByWithRelationInput = {};

		if (orderBy && HOTSPOT_ORDER_BY[orderBy]) {
			orderByQuery[HOTSPOT_ORDER_BY[orderBy]] = order;
		}

		// Get hotspots
		const [hotspots, total] = await Promise.all([
			this.prisma.hotspot.findMany({
				where,
				orderBy: orderByQuery,
				skip: pagi.offset,
				take: pagi.limit,
			}),
			this.prisma.hotspot.count({ where }),
		]);

		return new HotspotListResponseDto(
			hotspots.map((hotspot) => new HotspotDto(hotspot)),
			new PageMetaDto({
				pageOptionsDto: query,
				itemCount: total,
			}),
		);
	}

	async getHotspotById(
		tourId: string,
		sceneId: string,
		hotspotId: string,
		userId?: string,
	): Promise<HotspotWithDetailsDto> {
		// Verify tour and scene exist
		await this.verifyTourAndScene(tourId, sceneId);

		const hotspot = await this.prisma.hotspot.findFirst({
			where: {
				id: hotspotId,
				sceneId,
				deletedAt: null,
			},
			include: {
				targetScene: {
					select: {
						id: true,
						title: true,
						thumbnailUrl: true,
					},
				},
			},
		});

		if (!hotspot) {
			throw new NotFoundException(HotspotsUseCase.hotspotNotFound);
		}

		return new HotspotWithDetailsDto(
			hotspot as HotspotEntity,
			hotspot.targetScene || undefined,
		);
	}

	async createHotspot(
		tourId: string,
		sceneId: string,
		createDto: CreateHotspotDto,
		userId: string,
	): Promise<HotspotDto> {
		// Verify tour and scene exist
		await this.verifyTourAndScene(tourId, sceneId);

		// If target scene is specified, verify it exists and belongs to the same tour
		if (createDto.targetSceneId) {
			await this.verifyTargetScene(tourId, createDto.targetSceneId);
		}

		const hotspot = await this.prisma.hotspot.create({
			data: {
				...createDto,
				sceneId,
			},
		});

		return new HotspotDto(hotspot as HotspotEntity);
	}

	async updateHotspot(
		tourId: string,
		sceneId: string,
		hotspotId: string,
		updateDto: UpdateHotspotDto,
		userId?: string,
	): Promise<HotspotDto> {
		// Verify tour and scene exist
		await this.verifyTourAndScene(tourId, sceneId);

		// Verify hotspot exists
		const existingHotspot = await this.prisma.hotspot.findFirst({
			where: {
				id: hotspotId,
				sceneId,
				deletedAt: null,
			},
		});

		if (!existingHotspot) {
			throw new NotFoundException(HotspotsUseCase.hotspotNotFound);
		}

		// If target scene is being updated, verify it exists and belongs to the same tour
		if (updateDto.targetSceneId) {
			await this.verifyTargetScene(tourId, updateDto.targetSceneId);
		}

		const updatedHotspot = await this.prisma.hotspot.update({
			where: { id: hotspotId },
			data: {
				...updateDto,
				updatedAt: new Date(),
			},
		});

		return new HotspotDto(updatedHotspot as HotspotEntity);
	}

	async deleteHotspot(
		tourId: string,
		sceneId: string,
		hotspotId: string,
		userId?: string,
	): Promise<void> {
		// Verify tour and scene exist
		await this.verifyTourAndScene(tourId, sceneId);

		// Verify hotspot exists
		const hotspot = await this.prisma.hotspot.findFirst({
			where: {
				id: hotspotId,
				sceneId,
				deletedAt: null,
			},
		});

		if (!hotspot) {
			throw new NotFoundException(HotspotsUseCase.hotspotNotFound);
		}

		// Soft delete the hotspot
		await this.prisma.hotspot.update({
			where: { id: hotspotId },
			data: {
				deletedAt: new Date(),
			},
		});
	}

	async bulkCreateHotspots(
		tourId: string,
		sceneId: string,
		bulkDto: BulkCreateHotspotDto,
		userId?: string,
	): Promise<BulkHotspotResponseDto> {
		// Verify tour and scene exist
		await this.verifyTourAndScene(tourId, sceneId);

		const createdHotspots: HotspotEntity[] = [];
		let failedCount = 0;

		for (const hotspotDto of bulkDto.hotspots) {
			try {
				// Verify target scene if specified
				if (hotspotDto.targetSceneId) {
					// eslint-disable-next-line no-await-in-loop
					await this.verifyTargetScene(tourId, hotspotDto.targetSceneId);
				}

				// eslint-disable-next-line no-await-in-loop
				const hotspot = await this.prisma.hotspot.create({
					data: {
						...hotspotDto,
						sceneId,
					},
				});

				createdHotspots.push(hotspot as HotspotEntity);
			} catch (error) {
				failedCount++;
				console.error(`Failed to create hotspot: ${hotspotDto.title}`, error);
			}
		}

		return new BulkHotspotResponseDto(
			createdHotspots,
			bulkDto.hotspots.length,
			failedCount,
		);
	}

	private async verifyTourAndScene(
		tourId: string,
		sceneId: string,
	): Promise<void> {
		// Verify tour exists
		const tour = await this.prisma.virtualTour.findFirst({
			where: {
				id: tourId,
				deletedAt: null,
			},
		});

		if (!tour) {
			throw new NotFoundException(HotspotsUseCase.virtualTourNotFound);
		}

		// Verify scene exists and belongs to the tour
		const scene = await this.prisma.scene.findFirst({
			where: {
				id: sceneId,
				tourId,
				deletedAt: null,
			},
		});

		if (!scene) {
			throw new NotFoundException(HotspotsUseCase.sceneNotFound);
		}
	}

	private async verifyTargetScene(
		tourId: string,
		targetSceneId: string,
	): Promise<void> {
		const targetScene = await this.prisma.scene.findFirst({
			where: {
				id: targetSceneId,
				tourId,
				deletedAt: null,
			},
		});

		if (!targetScene) {
			throw new BadRequestException(
				'Target scene not found or does not belong to this tour',
			);
		}
	}
}
