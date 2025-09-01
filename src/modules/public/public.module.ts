import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { PrismaModule } from '../../prisma/prisma.module';
import { PublicToursModule } from './tours/tours.module';

@Module({
	imports: [
		PrismaModule,
		PublicToursModule,

		RouterModule.register([
			{
				path: 'public',
				children: [
					{ path: 'tours', module: PublicToursModule }, // path: /api/v1/public/tours
				],
			},
		]),
	],
	providers: [],
})
export class PublicModule {}
