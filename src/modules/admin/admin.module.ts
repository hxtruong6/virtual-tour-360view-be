// create module for admin to import all admin related modules
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { PrismaModule } from '../../prisma/prisma.module';
import { AdminAmenitiesModule } from './amenities/amenities.module';
import { AdminHotspotsModule } from './hotspots/hotspots.module';
import { AdminScenesModule } from './scenes/scenes.module';
import { AdminVirtualToursModule } from './virtual-tours/virtual-tours.module';

@Module({
	imports: [
		PrismaModule,
		AdminVirtualToursModule,
		AdminScenesModule,
		AdminHotspotsModule,
		AdminAmenitiesModule,

		RouterModule.register([
			{
				path: 'admin',
				children: [
					{ path: 'tours', module: AdminVirtualToursModule }, // path: /api/v1/admin/tours
					{ path: 'tours', module: AdminScenesModule }, // path: /api/v1/admin/tours/:tourId/scenes
					{ path: 'tours', module: AdminHotspotsModule }, // path: /api/v1/admin/tours/:tourId/scenes/:sceneId/hotspots
					{ path: 'amenities', module: AdminAmenitiesModule }, // path: /api/v1/admin/amenities
				],
			},
		]),
	],
	providers: [],
})
export class AdminModule {}
