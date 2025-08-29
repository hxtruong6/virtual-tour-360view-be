import { generateHash } from '../src/common/utils';
import { PrismaClient, UserRole, UserStatus } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Starting database seeding...');

	// Check if admin user already exists
	const existingAdmin = await prisma.user.findFirst({
		where: {
			id: '00000000-0000-0000-0000-000000000001',
		},
	});

	if (existingAdmin) {
		console.log('✅ Admin user already exists, skipping creation...');
		console.log(`   Email: ${existingAdmin.email}`);
		console.log(`   Role: ${existingAdmin.role}`);
		console.log(`   Status: ${existingAdmin.status}`);
		return;
	}

	// Create the default admin user
	const adminPassword = 'Admin@123456'; // Change this to a secure password
	const hashedPassword = generateHash(adminPassword);

	const adminUser = await prisma.user.create({
		data: {
			id: '00000000-0000-0000-0000-000000000001', // Matches ADMIN_USER_ID constant
			email: 'admin@virtualtour.com',
			username: 'admin',
			firstName: 'System',
			lastName: 'Administrator',
			role: UserRole.SUPER_ADMIN,
			status: UserStatus.ACTIVE,
			language: 'en',
			timezone: 'UTC',
			hashedPassword,
			emailVerifiedAt: new Date(),
			lastLoginAt: null,
		},
	});

	console.log('✅ Admin user created successfully!');
	console.log('📧 Login credentials:');
	console.log(`   Email: ${adminUser.email}`);
	console.log(`   Username: ${adminUser.username}`);
	console.log(`   Password: ${adminPassword}`);
	console.log(`   Role: ${adminUser.role}`);
	console.log(`   User ID: ${adminUser.id}`);
	console.log('');
	console.log('⚠️  IMPORTANT: Change the default password after first login!');

	// Create some sample virtual tours for testing (optional)
	const sampleTour = await prisma.virtualTour.create({
		data: {
			title: 'Welcome Demo Tour',
			description: 'A sample virtual tour to demonstrate the platform features',
			location: 'Virtual Space',
			slug: 'welcome-demo-tour',
			status: 'PUBLISHED',
			difficulty: 'BEGINNER',
			category: 'demo',
			tags: ['demo', 'tutorial', 'sample'],
			thumbnailUrl:
				'https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Demo+Tour',
			metaTitle: 'Welcome Demo Tour - Virtual Tour Platform',
			metaDescription:
				'Experience our virtual tour platform with this interactive demo',
			metaKeywords: ['virtual tour', 'demo', 'tutorial'],
			allowPublicAccess: true,
			allowEmbedding: true,
			autoplayEnabled: false,
			autoplaySpeed: 2,
			viewCount: 0,
			shareCount: 0,
			bookmarkCount: 0,
			averageRating: null,
			totalRatings: 0,
			totalScenes: 1,
			totalHotspots: 0,
			estimatedDuration: 5,
			publishedAt: new Date(),
			createdById: adminUser.id,
			updatedById: adminUser.id,
		},
	});

	// Create a sample scene for the demo tour
	await prisma.scene.create({
		data: {
			title: 'Welcome Scene',
			description: 'The main welcome scene for the demo tour',
			order: 1,
			panoramaUrl:
				'https://via.placeholder.com/4096x2048/2563EB/FFFFFF?text=360°+Demo+Panorama',
			thumbnailUrl:
				'https://via.placeholder.com/400x300/2563EB/FFFFFF?text=Scene+Thumbnail',
			mapPositionX: 0,
			mapPositionY: 0,
			initialViewAngle: 0,
			maxZoom: 3,
			minZoom: 0.5,
			tourId: sampleTour.id,
		},
	});

	console.log('✅ Sample demo tour created successfully!');
	console.log(`   Tour ID: ${sampleTour.id}`);
	console.log(`   Title: ${sampleTour.title}`);
	console.log(`   Slug: ${sampleTour.slug}`);
	console.log('');
	console.log('🎉 Database seeding completed successfully!');
}

main()
	.catch((e) => {
		console.error('❌ Error during seeding:');
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
