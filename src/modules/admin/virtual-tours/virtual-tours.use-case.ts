import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

import { ADMIN_USER_ID } from '../../../common/constants';
import { PageMetaDto } from '../../../common/dto/page-meta.dto';
import { generateSlug } from '../../../common/utils';
import { TourStatus } from '../../../generated/prisma';
import { PrismaService } from '../../../prisma/prisma.service';
import {
	CreateVirtualTourDto,
	UpdateVirtualTourDto,
	VirtualTourRequestDto,
} from './dto/virtual-tour.request.dto';
import {
	VirtualTourDetailDto,
	VirtualTourDto,
	VirtualTourListResponseDto,
} from './dto/virtual-tour.response.dto';

@Injectable()
export class VirtualToursUseCase {
	constructor(private prisma: PrismaService) {}

	async getVirtualTours(
		query: VirtualTourRequestDto,
	): Promise<VirtualTourListResponseDto> {
		const page = query.page || 1;
		const limit = query.pageSize || 10;
		const skip = (page - 1) * limit;

		// Build where clause
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const where: any = {
			deletedAt: null, // Only non-deleted tours
		};

		// Apply filters
		if (query.search) {
			where.OR = [
				{
					title: {
						contains: query.search,
						mode: 'insensitive',
					},
				},
				{
					description: {
						contains: query.search,
						mode: 'insensitive',
					},
				},
			];
		}

		if (query.status) {
			where.status = query.status;
		}

		if (query.category) {
			where.category = query.category;
		}

		if (query.difficulty) {
			where.difficulty = query.difficulty;
		}

		if (query.location) {
			where.location = {
				contains: query.location,
				mode: 'insensitive',
			};
		}

		if (query.tags && query.tags.length > 0) {
			where.tags = {
				hasSome: query.tags,
			};
		}

		if (query.createdById) {
			where.createdById = query.createdById;
		}

		// Build orderBy
		const orderBy: any = {};
		const sortBy = 'createdAt'; // Default sort field
		const sortOrder = 'desc'; // Default sort order
		orderBy[sortBy] = sortOrder;

		// Execute query
		const [tours, total] = await Promise.all([
			this.prisma.virtualTour.findMany({
				where,
				orderBy,
				skip,
				take: limit,
			}),
			this.prisma.virtualTour.count({ where }),
		]);

		return new VirtualTourListResponseDto(
			tours.map((tour) => new VirtualTourDto(tour)),
			new PageMetaDto({
				pageOptionsDto: query,
				itemCount: total,
			}),
		);
	}

	async getVirtualTourById(id: string): Promise<VirtualTourDetailDto> {
		const tour = await this.prisma.virtualTour.findFirst({
			where: {
				id,
				deletedAt: null,
			},
			include: {
				scenes: {
					where: {
						deletedAt: null,
					},
					orderBy: {
						order: 'asc',
					},
					include: {
						hotspots: {
							where: {
								deletedAt: null,
							},
							orderBy: {
								createdAt: 'asc',
							},
						},
					},
				},
			},
		});

		if (!tour) {
			throw new NotFoundException(`Virtual tour with ID ${id} not found`);
		}

		return new VirtualTourDetailDto(tour);
	}

	async createVirtualTour(
		createDto: CreateVirtualTourDto,
	): Promise<VirtualTourDto> {
		const slug = generateSlug(createDto.title);

		// Check if slug already exists
		const existingTour = await this.prisma.virtualTour.findFirst({
			where: {
				slug,
				deletedAt: null,
			},
		});

		if (existingTour) {
			throw new BadRequestException(`A tour with similar title already exists`);
		}

		const tour = await this.prisma.virtualTour.create({
			data: {
				title: createDto.title,
				description: createDto.description,
				location: createDto.location,
				slug,
				status: TourStatus.DRAFT,
				difficulty: createDto.difficulty,
				category: createDto.category,
				tags: createDto.tags || [],
				thumbnailUrl: createDto.thumbnailUrl,
				metaTitle: createDto.metaTitle,
				metaDescription: createDto.metaDescription,
				metaKeywords: createDto.metaKeywords || [],
				allowPublicAccess: createDto.allowPublicAccess ?? true,
				allowEmbedding: createDto.allowEmbedding ?? true,
				autoplayEnabled: createDto.autoplayEnabled ?? false,
				autoplaySpeed: createDto.autoplaySpeed || 2,
				viewCount: 0,
				shareCount: 0,
				bookmarkCount: 0,
				averageRating: null,
				totalRatings: 0,
				totalScenes: 0,
				totalHotspots: 0,
				estimatedDuration: createDto.estimatedDuration,
				createdById: ADMIN_USER_ID,
				updatedById: ADMIN_USER_ID,
			},
		});

		return new VirtualTourDto(tour);
	}

	async updateVirtualTour(
		id: string,
		updateDto: UpdateVirtualTourDto,
	): Promise<VirtualTourDto> {
		// Check if tour exists
		const existingTour = await this.prisma.virtualTour.findFirst({
			where: {
				id,
				deletedAt: null,
			},
		});

		if (!existingTour) {
			throw new NotFoundException(`Virtual tour with ID ${id} not found`);
		}

		// Generate new slug if title is being updated
		let newSlug = existingTour.slug;

		if (updateDto.title && updateDto.title !== existingTour.title) {
			newSlug = generateSlug(updateDto.title);

			// Check if new slug already exists
			const duplicateSlug = await this.prisma.virtualTour.findFirst({
				where: {
					slug: newSlug,
					id: { not: id },
					deletedAt: null,
				},
			});

			if (duplicateSlug) {
				throw new BadRequestException(
					`A tour with similar title already exists`,
				);
			}
		}

		// Prepare update data
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const updateData: any = {
			...updateDto,
			slug: newSlug,
			updatedById: ADMIN_USER_ID,
		};

		// Handle status-specific updates
		if (
			updateDto.status === TourStatus.PUBLISHED &&
			!existingTour.publishedAt
		) {
			updateData.publishedAt = new Date();
		}

		// Map DTO fields to database fields
		if (updateDto.thumbnailUrl !== undefined) {
			updateData.thumbnailUrl = updateDto.thumbnailUrl;
			delete updateData.thumbnailUrl;
		}

		if (updateDto.metaTitle !== undefined) {
			updateData.metaTitle = updateDto.metaTitle;
			delete updateData.metaTitle;
		}

		if (updateDto.metaDescription !== undefined) {
			updateData.metaDescription = updateDto.metaDescription;
			delete updateData.metaDescription;
		}

		if (updateDto.metaKeywords !== undefined) {
			updateData.metaKeywords = updateDto.metaKeywords;
			delete updateData.metaKeywords;
		}

		if (updateDto.allowPublicAccess !== undefined) {
			updateData.allowPublicAccess = updateDto.allowPublicAccess;
			delete updateData.allowPublicAccess;
		}

		if (updateDto.allowEmbedding !== undefined) {
			updateData.allowEmbedding = updateDto.allowEmbedding;
			delete updateData.allowEmbedding;
		}

		if (updateDto.autoplayEnabled !== undefined) {
			updateData.autoplayEnabled = updateDto.autoplayEnabled;
			delete updateData.autoplayEnabled;
		}

		if (updateDto.autoplaySpeed !== undefined) {
			updateData.autoplaySpeed = updateDto.autoplaySpeed;
			delete updateData.autoplaySpeed;
		}

		if (updateDto.estimatedDuration !== undefined) {
			updateData.estimatedDuration = updateDto.estimatedDuration;
			delete updateData.estimatedDuration;
		}

		const updatedTour = await this.prisma.virtualTour.update({
			where: { id },
			data: updateData,
		});

		return new VirtualTourDto(updatedTour);
	}

	async deleteVirtualTour(id: string): Promise<void> {
		// Check if tour exists
		const existingTour = await this.prisma.virtualTour.findFirst({
			where: {
				id,
				deletedAt: null,
			},
		});

		if (!existingTour) {
			throw new NotFoundException(`Virtual tour with ID ${id} not found`);
		}

		// Soft delete
		await this.prisma.virtualTour.update({
			where: { id },
			data: {
				deletedAt: new Date(),
			},
		});
	}

	async publishVirtualTour(id: string): Promise<VirtualTourDto> {
		// Check if tour exists
		const existingTour = await this.prisma.virtualTour.findFirst({
			where: {
				id,
				deletedAt: null,
			},
		});

		if (!existingTour) {
			throw new NotFoundException(`Virtual tour with ID ${id} not found`);
		}

		// Basic validation for publishing
		if (!existingTour.title || existingTour.totalScenes === 0) {
			throw new BadRequestException(
				'Tour cannot be published: missing title or scenes',
			);
		}

		if (existingTour.status === TourStatus.PUBLISHED) {
			throw new BadRequestException('Tour is already published');
		}

		const updatedTour = await this.prisma.virtualTour.update({
			where: { id },
			data: {
				status: TourStatus.PUBLISHED,
				publishedAt: new Date(),
				updatedById: ADMIN_USER_ID,
			},
		});

		return new VirtualTourDto(updatedTour);
	}

	async archiveVirtualTour(id: string): Promise<VirtualTourDto> {
		// Check if tour exists
		const existingTour = await this.prisma.virtualTour.findFirst({
			where: {
				id,
				deletedAt: null,
			},
		});

		if (!existingTour) {
			throw new NotFoundException(`Virtual tour with ID ${id} not found`);
		}

		const updatedTour = await this.prisma.virtualTour.update({
			where: { id },
			data: {
				status: TourStatus.ARCHIVED,
				updatedById: ADMIN_USER_ID,
			},
		});

		return new VirtualTourDto(updatedTour);
	}

	async duplicateVirtualTour(id: string): Promise<VirtualTourDto> {
		// Check if original tour exists
		const originalTour = await this.prisma.virtualTour.findFirst({
			where: {
				id,
				deletedAt: null,
			},
		});

		if (!originalTour) {
			throw new NotFoundException(`Virtual tour with ID ${id} not found`);
		}

		const newTitle = `${originalTour.title} (Copy)`;
		const newSlug = generateSlug(newTitle);

		const duplicatedTour = await this.prisma.virtualTour.create({
			data: {
				title: newTitle,
				description: originalTour.description,
				location: originalTour.location,
				slug: newSlug,
				status: TourStatus.DRAFT,
				difficulty: originalTour.difficulty,
				category: originalTour.category,
				tags: originalTour.tags,
				thumbnailUrl: originalTour.thumbnailUrl,
				metaTitle: originalTour.metaTitle,
				metaDescription: originalTour.metaDescription,
				metaKeywords: originalTour.metaKeywords,
				allowPublicAccess: originalTour.allowPublicAccess,
				allowEmbedding: originalTour.allowEmbedding,
				autoplayEnabled: originalTour.autoplayEnabled,
				autoplaySpeed: originalTour.autoplaySpeed,
				viewCount: 0,
				shareCount: 0,
				bookmarkCount: 0,
				averageRating: null,
				totalRatings: 0,
				totalScenes: 0,
				totalHotspots: 0,
				estimatedDuration: originalTour.estimatedDuration,
				publishedAt: null,
				createdById: ADMIN_USER_ID,
				updatedById: ADMIN_USER_ID,
			},
		});

		return new VirtualTourDto(duplicatedTour);
	}
}
