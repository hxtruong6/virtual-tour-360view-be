import { Injectable } from '@nestjs/common';

import { PageMetaDto } from '../../../common/dto/page-meta.dto';
import { type PageOptionsDto } from '../../../common/dto/page-options.dto';
import { PageDto } from '../../../common/dto/page.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import {
	AssignAmenityToTourDto,
	CreateAmenityDto,
	UpdateAmenityDto,
} from './dto/amenity.request.dto';
import {
	AmenityDto,
	AmenityListResponseDto,
	TourAmenityDto,
} from './dto/amenity.response.dto';

@Injectable()
export class AmenitiesUseCase {
	constructor(private readonly prismaService: PrismaService) {}

	/**
	 * Get all amenities with pagination and filtering
	 */
	async getAllAmenities(
		pageOptionsDto: PageOptionsDto,
		category?: string,
	): Promise<AmenityListResponseDto> {
		const where = {
			deletedAt: null,
			...(category && { category }),
		};

		const [amenities, itemCount] = await Promise.all([
			this.prismaService.amenity.findMany({
				where,
				orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
				skip: pageOptionsDto.skip,
				take: pageOptionsDto.pageSize,
			}),
			this.prismaService.amenity.count({ where }),
		]);

		const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
		const amenityDtos = amenities.map((amenity) => new AmenityDto(amenity));

		return new PageDto(amenityDtos, pageMetaDto);
	}

	/**
	 * Get active amenities only
	 */
	async getActiveAmenities(category?: string): Promise<AmenityDto[]> {
		const amenities = await this.prismaService.amenity.findMany({
			where: {
				deletedAt: null,
				isActive: true,
				...(category && { category }),
			},
			orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
		});

		return amenities.map((amenity) => new AmenityDto(amenity));
	}

	/**
	 * Get amenity by ID
	 */
	async getAmenityById(id: string): Promise<AmenityDto> {
		const amenity = await this.prismaService.amenity.findUniqueOrThrow({
			where: { id, deletedAt: null },
		});

		return new AmenityDto(amenity);
	}

	/**
	 * Create a new amenity
	 */
	async createAmenity(createAmenityDto: CreateAmenityDto): Promise<AmenityDto> {
		const amenity = await this.prismaService.amenity.create({
			data: createAmenityDto,
		});

		return new AmenityDto(amenity);
	}

	/**
	 * Update an amenity
	 */
	async updateAmenity(
		id: string,
		updateAmenityDto: UpdateAmenityDto,
	): Promise<AmenityDto> {
		const amenity = await this.prismaService.amenity.update({
			where: { id, deletedAt: null },
			data: updateAmenityDto,
		});

		return new AmenityDto(amenity);
	}

	/**
	 * Soft delete an amenity
	 */
	async deleteAmenity(id: string): Promise<void> {
		await this.prismaService.amenity.update({
			where: { id, deletedAt: null },
			data: { deletedAt: new Date() },
		});
	}

	/**
	 * Assign amenities to a tour
	 */
	async assignAmenitiesToTour(
		tourId: string,
		assignAmenityDto: AssignAmenityToTourDto,
	): Promise<void> {
		const { amenityIds, featuredAmenityIds = [] } = assignAmenityDto;

		// First, remove existing tour amenities
		await this.prismaService.tourAmenity.deleteMany({
			where: { tourId },
		});

		// Then, create new tour amenities
		const tourAmenities = amenityIds.map((amenityId) => ({
			tourId,
			amenityId,
			isFeatured: featuredAmenityIds.includes(amenityId),
		}));

		await this.prismaService.tourAmenity.createMany({
			data: tourAmenities,
		});
	}

	/**
	 * Get amenities for a specific tour
	 */
	async getTourAmenities(tourId: string): Promise<TourAmenityDto[]> {
		const tourAmenities = await this.prismaService.tourAmenity.findMany({
			where: { tourId },
			include: {
				amenity: true,
			},
			orderBy: [
				{ isFeatured: 'desc' },
				{ amenity: { displayOrder: 'asc' } },
				{ amenity: { name: 'asc' } },
			],
		});

		return tourAmenities.map((tourAmenity) => new TourAmenityDto(tourAmenity));
	}

	/**
	 * Remove amenity from tour
	 */
	async removeAmenityFromTour(
		tourId: string,
		amenityId: string,
	): Promise<void> {
		await this.prismaService.tourAmenity.deleteMany({
			where: { tourId, amenityId },
		});
	}
}
