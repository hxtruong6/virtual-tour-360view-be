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
import { ScenesUseCase } from './scenes.use-case';

@Controller({ path: '', version: EVersion.V1 })
@ApiTags('admin/tours/scenes')
export class ScenesController {
	constructor(private readonly scenesUseCase: ScenesUseCase) {}

	@Get(':tourId/scenes')
	@HttpCode(HttpStatus.OK)
	@Auth()
	@ApiOperation({
		summary: 'Get tour scenes',
		description: 'Admin API to get all scenes for a specific virtual tour',
	})
	@ApiParam({ name: 'tourId', description: 'Virtual tour ID' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'List of tour scenes retrieved successfully',
		type: SceneListResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Virtual tour not found',
	})
	async getScenesByTourId(
		@Param('tourId') tourId: string,
		@Query() query: SceneRequestDto,
	) {
		return this.scenesUseCase.getScenesByTourId(tourId, query);
	}

	@Get(':tourId/scenes/:sceneId')
	@HttpCode(HttpStatus.OK)
	@Auth()
	@ApiOperation({
		summary: 'Get scene details',
		description:
			'Admin API to get detailed scene information including hotspots',
	})
	@ApiParam({ name: 'tourId', description: 'Virtual tour ID' })
	@ApiParam({ name: 'sceneId', description: 'Scene ID' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Scene details retrieved successfully',
		type: SceneWithHotspotsDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Virtual tour or scene not found',
	})
	async getSceneById(
		@Param('tourId') tourId: string,
		@Param('sceneId') sceneId: string,
		@AuthUser() user: AuthenUser,
	) {
		return this.scenesUseCase.getSceneById(tourId, sceneId, user.id);
	}

	@Post(':tourId/scenes')
	@HttpCode(HttpStatus.CREATED)
	@Auth()
	@ApiOperation({
		summary: 'Create scene',
		description: 'Admin API to create a new scene in a virtual tour',
	})
	@ApiParam({ name: 'tourId', description: 'Virtual tour ID' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Scene created successfully',
		type: SceneDto,
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid scene data or order conflict',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Virtual tour not found',
	})
	async createScene(
		@Param('tourId') tourId: string,
		@Body() createDto: CreateSceneDto,
		@AuthUser() user: AuthenUser,
	) {
		return this.scenesUseCase.createScene(tourId, createDto, user.id);
	}

	@Put(':tourId/scenes/:sceneId')
	@HttpCode(HttpStatus.OK)
	@Auth()
	@ApiOperation({
		summary: 'Update scene',
		description: 'Admin API to update an existing scene',
	})
	@ApiParam({ name: 'tourId', description: 'Virtual tour ID' })
	@ApiParam({ name: 'sceneId', description: 'Scene ID' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Scene updated successfully',
		type: SceneDto,
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid scene data or order conflict',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Virtual tour or scene not found',
	})
	async updateScene(
		@Param('tourId') tourId: string,
		@Param('sceneId') sceneId: string,
		@Body() updateDto: UpdateSceneDto,
		@AuthUser() user: AuthenUser,
	) {
		return this.scenesUseCase.updateScene(tourId, sceneId, updateDto, user.id);
	}

	@Delete(':tourId/scenes/:sceneId')
	@HttpCode(HttpStatus.NO_CONTENT)
	@Auth()
	@ApiOperation({
		summary: 'Delete scene',
		description: 'Admin API to soft delete a scene from a virtual tour',
	})
	@ApiParam({ name: 'tourId', description: 'Virtual tour ID' })
	@ApiParam({ name: 'sceneId', description: 'Scene ID' })
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: 'Scene deleted successfully',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Virtual tour or scene not found',
	})
	async deleteScene(
		@Param('tourId') tourId: string,
		@Param('sceneId') sceneId: string,
		@AuthUser() user: AuthenUser,
	) {
		return this.scenesUseCase.deleteScene(tourId, sceneId, user.id);
	}

	@Post(':tourId/scenes/bulk')
	@HttpCode(HttpStatus.CREATED)
	@Auth()
	@ApiOperation({
		summary: 'Bulk create scenes',
		description: 'Admin API to create multiple scenes at once',
	})
	@ApiParam({ name: 'tourId', description: 'Virtual tour ID' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Scenes created successfully',
		type: BulkSceneResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Virtual tour not found',
	})
	async bulkCreateScenes(
		@Param('tourId') tourId: string,
		@Body() bulkDto: BulkCreateSceneDto,
		@AuthUser() user: AuthenUser,
	) {
		return this.scenesUseCase.bulkCreateScenes(tourId, bulkDto, user.id);
	}

	@Put(':tourId/scenes/reorder')
	@HttpCode(HttpStatus.OK)
	@Auth()
	@ApiOperation({
		summary: 'Reorder scenes',
		description: 'Admin API to reorder scenes in a virtual tour',
	})
	@ApiParam({ name: 'tourId', description: 'Virtual tour ID' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Scenes reordered successfully',
		type: SceneListResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid scene data',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Virtual tour or scenes not found',
	})
	async reorderScenes(
		@Param('tourId') tourId: string,
		@Body() reorderData: { scenes: Array<{ sceneId: string; order: number }> },
		@AuthUser() user: AuthenUser,
	) {
		return this.scenesUseCase.reorderScenes(
			tourId,
			reorderData.scenes,
			user.id,
		);
	}
}
