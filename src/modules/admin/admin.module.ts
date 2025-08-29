// create module for admin to import all admin related modules
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { PrismaModule } from '../../prisma/prisma.module';
import { AdminScenesModule } from './scenes/scenes.module';
import { AdminVirtualToursModule } from './virtual-tours/virtual-tours.module';

@Module({
	imports: [
		PrismaModule,
		AdminVirtualToursModule,
		AdminScenesModule,

		RouterModule.register([
			{
				path: 'admin',
				children: [
					{ path: 'tours', module: AdminVirtualToursModule }, // path: /api/v1/admin/tours
					{ path: 'tours', module: AdminScenesModule }, // path: /api/v1/admin/tours/:tourId/scenes
				],
			},
		]),
	],
	providers: [],
})
export class AdminModule {}
