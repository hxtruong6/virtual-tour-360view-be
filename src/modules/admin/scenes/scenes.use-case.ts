import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

import {
	EOrder,
	SCENE_ORDER_BY,
	SCENE_QUERY_BY,
} from '../../../common/constants';
import { PageMetaDto } from '../../../common/dto/page-meta.dto';
import { getPagination } from '../../../common/utils';
import { SceneEntity } from '../../../core/entities/scene.entity';
import { Prisma } from '../../../generated/prisma';
import { PrismaService } from '../../../prisma/prisma.service';
import {
	BulkCreateSceneDto,
	CreateSceneDto,
	SceneRequestDto,
	UpdateSceneDto,
} from './dto/scene.request.dto';
import {
	BulkSceneResponseDto,
	SceneDto,
	SceneListResponseDto,
	SceneWithHotspotsDto,
} from './dto/scene.response.dto';

@Injectable()
export class ScenesUseCase {
	private static readonly virtualTourNotFound = 'Virtual tour not found';

	constructor(private readonly prisma: PrismaService) {}

	async getScenesByTourId(
		tourId: string,
		query: SceneRequestDto,
	): Promise<SceneListResponseDto> {
		const { page, pageSize, q, qBy, order, orderBy } = query;

		console.info('xxx001 query', query);

		const pagi = getPagination({ page, pageSize });

		// Verify tour exists and user has access (for now, just check existence)
		const tour = await this.prisma.virtualTour.findFirst({
			where: {
				id: tourId,
				deletedAt: null,
			},
		});

		if (!tour) {
			throw new NotFoundException(ScenesUseCase.virtualTourNotFound);
		}

		// Build where clause
		const where: Prisma.SceneWhereInput = {
			tourId,
			deletedAt: null,
		};

		if (q && qBy && SCENE_QUERY_BY[qBy]) {
			where[SCENE_QUERY_BY[qBy]] = {
				contains: q,
				mode: 'insensitive',
			};
		}

		// Build order by
		const orderByQuery: Prisma.SceneOrderByWithRelationInput = {};

		if (orderBy && SCENE_ORDER_BY[orderBy]) {
			orderByQuery[SCENE_ORDER_BY[orderBy]] = order;
		}

		// Get scenes
		const [scenes, total] = await Promise.all([
			this.prisma.scene.findMany({
				where,
				orderBy: orderByQuery,
				skip: pagi.offset,
				take: pagi.limit,
			}),
			this.prisma.scene.count({ where }),
		]);

		return new SceneListResponseDto(
			scenes.map((scene) => new SceneDto(scene)),
			new PageMetaDto({
				pageOptionsDto: query,
				itemCount: total,
			}),
		);
	}

	async getSceneById(
		tourId: string,
		sceneId: string,
		userId?: string,
	): Promise<SceneWithHotspotsDto> {
		// Verify tour exists
		const tour = await this.prisma.virtualTour.findFirst({
			where: {
				id: tourId,
				deletedAt: null,
			},
		});

		if (!tour) {
			throw new NotFoundException(ScenesUseCase.virtualTourNotFound);
		}

		const scene = await this.prisma.scene.findFirst({
			where: {
				id: sceneId,
				tourId,
				deletedAt: null,
			},
		});

		if (!scene) {
			throw new NotFoundException('Scene not found');
		}

		// For now, return empty hotspots array - will be implemented when hotspot management is ready
		const hotspots: Array<{ id: string; type: string; title: string }> = [];

		return new SceneWithHotspotsDto(scene as SceneEntity, hotspots);
	}

	async createScene(
		tourId: string,
		createDto: CreateSceneDto,
		userId: string,
	): Promise<SceneDto> {
		// Verify tour exists
		const tour = await this.prisma.virtualTour.findFirst({
			where: {
				id: tourId,
				deletedAt: null,
			},
		});

		if (!tour) {
			throw new NotFoundException(ScenesUseCase.virtualTourNotFound);
		}

		// Check if order already exists for this tour
		if (createDto.order) {
			const existingScene = await this.prisma.scene.findFirst({
				where: {
					tourId,
					order: createDto.order,
					deletedAt: null,
				},
			});

			if (existingScene) {
				throw new BadRequestException(
					`Scene with order ${createDto.order} already exists in this tour`,
				);
			}
		}

		// If no order specified, get the next available order
		if (!createDto.order) {
			const maxOrder = await this.prisma.scene.aggregate({
				where: {
					tourId,
					deletedAt: null,
				},
				_max: {
					order: true,
				},
			});

			createDto.order = (maxOrder._max.order || 0) + 1;
		}

		const scene = await this.prisma.scene.create({
			data: {
				...createDto,
				tourId,
				// createdById: userId,
			},
		});

		return new SceneDto(scene as SceneEntity);
	}

	async updateScene(
		tourId: string,
		sceneId: string,
		updateDto: UpdateSceneDto,
		userId?: string,
	): Promise<SceneDto> {
		// Verify tour exists
		const tour = await this.prisma.virtualTour.findFirst({
			where: {
				id: tourId,
				deletedAt: null,
			},
		});

		if (!tour) {
			throw new NotFoundException(ScenesUseCase.virtualTourNotFound);
		}

		// Verify scene exists
		const existingScene = await this.prisma.scene.findFirst({
			where: {
				id: sceneId,
				tourId,
				deletedAt: null,
			},
		});

		if (!existingScene) {
			throw new NotFoundException('Scene not found');
		}

		// Check if new order conflicts with existing scenes
		if (updateDto.order && updateDto.order !== existingScene.order) {
			const conflictingScene = await this.prisma.scene.findFirst({
				where: {
					tourId,
					order: updateDto.order,
					deletedAt: null,
					id: { not: sceneId },
				},
			});

			if (conflictingScene) {
				throw new BadRequestException(
					`Scene with order ${updateDto.order} already exists in this tour`,
				);
			}
		}

		const updatedScene = await this.prisma.scene.update({
			where: { id: sceneId },
			data: {
				...updateDto,
				updatedAt: new Date(),
			},
		});

		return new SceneDto(updatedScene as SceneEntity);
	}

	async deleteScene(
		tourId: string,
		sceneId: string,
		userId?: string,
	): Promise<void> {
		// Verify tour exists
		const tour = await this.prisma.virtualTour.findFirst({
			where: {
				id: tourId,
				deletedAt: null,
			},
		});

		if (!tour) {
			throw new NotFoundException(ScenesUseCase.virtualTourNotFound);
		}

		// Verify scene exists
		const scene = await this.prisma.scene.findFirst({
			where: {
				id: sceneId,
				tourId,
				deletedAt: null,
			},
		});

		if (!scene) {
			throw new NotFoundException('Scene not found');
		}

		// Soft delete the scene
		await this.prisma.scene.update({
			where: { id: sceneId },
			data: {
				deletedAt: new Date(),
			},
		});
	}

	async bulkCreateScenes(
		tourId: string,
		bulkDto: BulkCreateSceneDto,
		userId?: string,
	): Promise<BulkSceneResponseDto> {
		// Verify tour exists
		const tour = await this.prisma.virtualTour.findFirst({
			where: {
				id: tourId,
				deletedAt: null,
			},
		});

		if (!tour) {
			throw new NotFoundException(ScenesUseCase.virtualTourNotFound);
		}

		const createdScenes: SceneEntity[] = [];
		let failedCount = 0;

		// Get current max order to start numbering from
		const maxOrder = await this.prisma.scene.aggregate({
			where: {
				tourId,
				deletedAt: null,
			},
			_max: {
				order: true,
			},
		});

		let currentOrder = (maxOrder._max.order || 0) + 1;

		for (const sceneDto of bulkDto.scenes) {
			try {
				// Assign order if not provided
				if (!sceneDto.order) {
					sceneDto.order = currentOrder++;
				}

				// eslint-disable-next-line no-await-in-loop
				const scene = await this.prisma.scene.create({
					data: {
						...sceneDto,
						tourId,
					},
				});

				createdScenes.push(scene as SceneEntity);
			} catch (error) {
				failedCount++;
				console.error(`Failed to create scene: ${sceneDto.title}`, error);
			}
		}

		return new BulkSceneResponseDto(
			createdScenes,
			bulkDto.scenes.length,
			failedCount,
		);
	}

	async reorderScenes(
		tourId: string,
		sceneOrders: Array<{ sceneId: string; order: number }>,
		userId?: string,
	): Promise<SceneListResponseDto> {
		// Verify tour exists
		const tour = await this.prisma.virtualTour.findFirst({
			where: {
				id: tourId,
				deletedAt: null,
			},
		});

		if (!tour) {
			throw new NotFoundException(ScenesUseCase.virtualTourNotFound);
		}

		// Verify all scenes exist and belong to the tour
		const sceneIds = sceneOrders.map((so) => so.sceneId);
		const existingScenes = await this.prisma.scene.findMany({
			where: {
				id: { in: sceneIds },
				tourId,
				deletedAt: null,
			},
		});

		if (existingScenes.length !== sceneIds.length) {
			throw new BadRequestException('One or more scenes not found');
		}

		// Update scenes in a transaction
		await this.prisma.$transaction(async (tx) => {
			for (const { sceneId, order } of sceneOrders) {
				// eslint-disable-next-line no-await-in-loop
				await tx.scene.update({
					where: { id: sceneId },
					data: { order, updatedAt: new Date() },
				});
			}
		});

		// Return updated scenes list
		const requestDto = {
			page: 1,
			pageSize: 100,
			orderBy: 'order',
			order: EOrder.ASC,
		} as SceneRequestDto;

		return this.getScenesByTourId(tourId, requestDto);
	}
}
