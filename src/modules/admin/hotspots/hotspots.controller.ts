import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Put,
	Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { EVersion } from '../../../common/constants';
import { AuthenUser } from '../../../core/entities';
import { AuthUser } from '../../../decorators';
import { Auth } from '../../../decorators/http.decorators';
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
import { HotspotsUseCase } from './hotspots.use-case';

@Controller({ path: '', version: EVersion.V1 })
@ApiTags('admin/tours/scenes/hotspots')
export class HotspotsController {
	constructor(private readonly hotspotsUseCase: HotspotsUseCase) {}

	@Get(':tourId/scenes/:sceneId/hotspots')
	@HttpCode(HttpStatus.OK)
	@Auth()
	@ApiOperation({
		summary: 'Get scene hotspots',
		description: 'Admin API to get all hotspots for a specific scene',
	})
	@ApiParam({ name: 'tourId', description: 'Virtual tour ID' })
	@ApiParam({ name: 'sceneId', description: 'Scene ID' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'List of scene hotspots retrieved successfully',
		type: HotspotListResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Virtual tour or scene not found',
	})
	async getHotspotsBySceneId(
		@Param('tourId') tourId: string,
		@Param('sceneId') sceneId: string,
		@Query() query: HotspotRequestDto,
	) {
		return this.hotspotsUseCase.getHotspotsBySceneId(tourId, sceneId, query);
	}

	@Get(':tourId/scenes/:sceneId/hotspots/:hotspotId')
	@HttpCode(HttpStatus.OK)
	@Auth()
	@ApiOperation({
		summary: 'Get hotspot details',
		description:
			'Admin API to get detailed hotspot information including target scene details',
	})
	@ApiParam({ name: 'tourId', description: 'Virtual tour ID' })
	@ApiParam({ name: 'sceneId', description: 'Scene ID' })
	@ApiParam({ name: 'hotspotId', description: 'Hotspot ID' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Hotspot details retrieved successfully',
		type: HotspotWithDetailsDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Virtual tour, scene or hotspot not found',
	})
	async getHotspotById(
		@Param('tourId') tourId: string,
		@Param('sceneId') sceneId: string,
		@Param('hotspotId') hotspotId: string,
		@AuthUser() user: AuthenUser,
	) {
		return this.hotspotsUseCase.getHotspotById(
			tourId,
			sceneId,
			hotspotId,
			user.id,
		);
	}

	@Post(':tourId/scenes/:sceneId/hotspots')
	@HttpCode(HttpStatus.CREATED)
	@Auth()
	@ApiOperation({
		summary: 'Create hotspot',
		description: 'Admin API to create a new hotspot in a scene',
	})
	@ApiParam({ name: 'tourId', description: 'Virtual tour ID' })
	@ApiParam({ name: 'sceneId', description: 'Scene ID' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Hotspot created successfully',
		type: HotspotDto,
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid hotspot data or target scene not found',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Virtual tour or scene not found',
	})
	async createHotspot(
		@Param('tourId') tourId: string,
		@Param('sceneId') sceneId: string,
		@Body() createDto: CreateHotspotDto,
		@AuthUser() user: AuthenUser,
	) {
		return this.hotspotsUseCase.createHotspot(
			tourId,
			sceneId,
			createDto,
			user.id,
		);
	}

	@Put(':tourId/scenes/:sceneId/hotspots/:hotspotId')
	@HttpCode(HttpStatus.OK)
	@Auth()
	@ApiOperation({
		summary: 'Update hotspot',
		description: 'Admin API to update an existing hotspot',
	})
	@ApiParam({ name: 'tourId', description: 'Virtual tour ID' })
	@ApiParam({ name: 'sceneId', description: 'Scene ID' })
	@ApiParam({ name: 'hotspotId', description: 'Hotspot ID' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Hotspot updated successfully',
		type: HotspotDto,
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid hotspot data or target scene not found',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Virtual tour, scene or hotspot not found',
	})
	async updateHotspot(
		@Param('tourId') tourId: string,
		@Param('sceneId') sceneId: string,
		@Param('hotspotId') hotspotId: string,
		@Body() updateDto: UpdateHotspotDto,
		@AuthUser() user: AuthenUser,
	) {
		return this.hotspotsUseCase.updateHotspot(
			tourId,
			sceneId,
			hotspotId,
			updateDto,
			user.id,
		);
	}

	@Delete(':tourId/scenes/:sceneId/hotspots/:hotspotId')
	@HttpCode(HttpStatus.NO_CONTENT)
	@Auth()
	@ApiOperation({
		summary: 'Delete hotspot',
		description: 'Admin API to soft delete a hotspot from a scene',
	})
	@ApiParam({ name: 'tourId', description: 'Virtual tour ID' })
	@ApiParam({ name: 'sceneId', description: 'Scene ID' })
	@ApiParam({ name: 'hotspotId', description: 'Hotspot ID' })
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: 'Hotspot deleted successfully',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Virtual tour, scene or hotspot not found',
	})
	async deleteHotspot(
		@Param('tourId') tourId: string,
		@Param('sceneId') sceneId: string,
		@Param('hotspotId') hotspotId: string,
		@AuthUser() user: AuthenUser,
	) {
		return this.hotspotsUseCase.deleteHotspot(
			tourId,
			sceneId,
			hotspotId,
			user.id,
		);
	}

	@Post(':tourId/scenes/:sceneId/hotspots/bulk')
	@HttpCode(HttpStatus.CREATED)
	@Auth()
	@ApiOperation({
		summary: 'Bulk create hotspots',
		description: 'Admin API to create multiple hotspots at once',
	})
	@ApiParam({ name: 'tourId', description: 'Virtual tour ID' })
	@ApiParam({ name: 'sceneId', description: 'Scene ID' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Hotspots created successfully',
		type: BulkHotspotResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Virtual tour or scene not found',
	})
	async bulkCreateHotspots(
		@Param('tourId') tourId: string,
		@Param('sceneId') sceneId: string,
		@Body() bulkDto: BulkCreateHotspotDto,
		@AuthUser() user: AuthenUser,
	) {
		return this.hotspotsUseCase.bulkCreateHotspots(
			tourId,
			sceneId,
			bulkDto,
			user.id,
		);
	}
}
