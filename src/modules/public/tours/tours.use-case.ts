import { Injectable, NotFoundException } from '@nestjs/common';

import { EOrder } from '../../../common/constants';
import { PageMetaDto } from '../../../common/dto/page-meta.dto';
import { TourStatus } from '../../../generated/prisma';
import { PrismaService } from '../../../prisma/prisma.service';
import { PublicTourRequestDto } from './dto/public-tour.request.dto';
import {
	PublicTourDetailDto,
	PublicTourDto,
	PublicTourListResponseDto,
} from './dto/public-tour.response.dto';

@Injectable()
export class PublicToursUseCase {
	constructor(private prisma: PrismaService) {}

	async getPublishedTours(
		query: PublicTourRequestDto,
	): Promise<PublicTourListResponseDto> {
		const page = query.page || 1;
		const limit = query.pageSize || 10;
		const skip = (page - 1) * limit;

		// Build where clause - only published tours that allow public access
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const where: any = {
			deletedAt: null,
			status: TourStatus.PUBLISHED,
			allowPublicAccess: true,
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

		// Filter by apartment type
		if (query.apartmentType) {
			where.apartmentMetadata = {
				path: ['type', 'id'],
				equals: query.apartmentType,
			};
		}

		// Filter by amenities - tours that have any of the specified amenities
		if (query.amenities && query.amenities.length > 0) {
			where.amenities = {
				some: {
					amenityId: {
						in: query.amenities,
					},
				},
			};
		}

		// Build orderBy - default to publishedAt desc for public tours
		const orderBy: Record<string, EOrder> = {};
		const sortBy = 'publishedAt'; // Default sort field for public tours
		const sortOrder = EOrder.DESC; // Default sort order
		orderBy[sortBy] = sortOrder;

		// Execute query
		const [tours, total] = await Promise.all([
			this.prisma.virtualTour.findMany({
				where,
				orderBy,
				skip,
				take: limit,
				include: {
					amenities: {
						include: {
							amenity: true,
						},
						orderBy: [
							{ isFeatured: 'desc' },
							{ amenity: { displayOrder: 'asc' } },
						],
					},
				},
			}),
			this.prisma.virtualTour.count({ where }),
		]);

		return new PublicTourListResponseDto(
			tours.map((tour) => new PublicTourDto(tour)),
			new PageMetaDto({
				pageOptionsDto: query,
				itemCount: total,
			}),
		);
	}

	async getTourBySlug(slug: string): Promise<PublicTourDetailDto> {
		const tour = await this.prisma.virtualTour.findFirst({
			where: {
				OR: [{ slug }, { id: slug }],
				deletedAt: null,
				status: TourStatus.PUBLISHED,
				allowPublicAccess: true,
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
				amenities: {
					include: {
						amenity: true,
					},
					orderBy: [
						{ isFeatured: 'desc' },
						{ amenity: { displayOrder: 'asc' } },
					],
				},
			},
		});

		if (!tour) {
			throw new NotFoundException(`Virtual tour with slug '${slug}' not found`);
		}

		return new PublicTourDetailDto(tour);
	}
}
