// create module for admin to import all admin related modules
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { PrismaModule } from '../../prisma/prisma.module';
import { AdminVirtualToursModule } from './virtual-tours/virtual-tours.module';

@Module({
	imports: [
		PrismaModule,
		AdminVirtualToursModule,

		RouterModule.register([
			{
				path: 'admin',
				children: [
					{ path: 'virtual-tours', module: AdminVirtualToursModule }, // path: /api/v1/admin/virtual-tours
				],
			},
		]),
	],
	providers: [],
})
export class AdminModule {}
