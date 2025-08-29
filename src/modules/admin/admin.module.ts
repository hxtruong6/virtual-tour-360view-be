// create module for admin to import all admin related modules
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { DataServicesModule } from '../../infrastructure/data-services/sql/data-services.module';
import { AdminUserModule } from './user/user.module';

@Module({
	imports: [
		DataServicesModule,

		RouterModule.register([
			// step 2: register all modules
			{
				path: 'admin',
				children: [
					{ path: 'users', module: AdminUserModule }, // path: /api/v1/admin/users
				],
			},
		]),
	],
	providers: [],
})
export class AdminModule {}
