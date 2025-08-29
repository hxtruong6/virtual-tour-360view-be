/* eslint-disable jest/no-commented-out-tests */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
	let app: INestApplication;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let accessToken: string;

	beforeAll(async () => {
		const moduleFixture = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
		app = moduleFixture.createNestApplication();
		await app.init();
	});

	const adminUser = {
		userType: 'admin',
		email: 'Dimitri_Connelly@yahoo.com',
		password: 'iProtect@123',
		fullName: 'Dimitri Connelly',
		phone: '0906956979',
		phoneCountryCode: '+84',
		role: 'mod',
	};

	// it('/auth/register (POST)', () =>
	// 	request(app.getHttpServer())
	// 		.post('/auth/register')
	// 		.send(adminUser)
	// 		.expect(200)
	// 		.expect((res) => {
	// 			expect(res.body).toHaveProperty('user');
	// 			expect(res.body.user).toHaveProperty('id');
	// 		}));

	// it('/auth/login (POST)', async () => {
	// 	const response = await request(app.getHttpServer())
	// 		.post('/auth/login')
	// 		.send({
	// 			userType: adminUser.userType,
	// 			phone: adminUser.phone,
	// 			phoneCountryCode: adminUser.phoneCountryCode,
	// 			password: adminUser.password,
	// 		})
	// 		.expect(200)
	// 		.expect((res) => {
	// 			expect(res.body).toHaveProperty('token');
	// 			expect(res.body.token).toHaveProperty('accessToken');
	// 		});

	// 	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	// 	accessToken = response.body.token.accessToken;
	// });

	// it('/auth/me (GET)', () =>
	// 	request(app.getHttpServer())
	// 		.get('/auth/me')
	// 		.set({ Authorization: `Bearer ${accessToken}` })
	// 		.expect(200)
	// 		.expect((res) => {
	// 			expect(res.body).toHaveProperty('user');
	// 			expect(res.body.user).toHaveProperty('id');
	// 		}));

	it('/health (GET)', async () => {
		return request(app.getHttpServer())
			.get('/health')
			.expect(200)
			.expect((res) => {
				expect(res.body).toHaveProperty('status', 'ok');
				// expect(res.body.info).toHaveProperty('kysely-pg-database');
				// expect(res.body.info['kysely-pg-database']).toHaveProperty(
				// 	'status',
				// 	'up',
				// );
			});
	});

	afterAll(async () => {
		await app.close();
	}, 5000);
});
