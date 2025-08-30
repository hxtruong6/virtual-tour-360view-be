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

	// Seed amenities data
	console.log('🏢 Seeding amenities data...');

	const internalAmenities = [
		{
			name: 'Retail pods',
			description: 'Cửa hàng tiện ích',
			category: 'internal',
			iconName: 'shopping-bag',
			imageUrl: '/demo/1.png',
			displayOrder: 1,
		},
		{
			name: 'Nhà hàng',
			description: 'Nhà hàng cao cấp',
			category: 'internal',
			iconName: 'utensils',
			imageUrl: '/demo/2.png',
			displayOrder: 2,
		},
		{
			name: 'Cafe',
			description: 'Không gian thư giãn',
			category: 'internal',
			iconName: 'coffee',
			imageUrl: '/demo/3.png',
			displayOrder: 3,
		},
		{
			name: 'Jjimjilbang',
			description: 'Spa truyền thống Hàn Quốc',
			category: 'internal',
			iconName: 'waves',
			imageUrl: '/demo/4.png',
			displayOrder: 4,
		},
		{
			name: 'Elite fitness',
			description: 'Phòng gym cao cấp',
			category: 'internal',
			iconName: 'dumbbell',
			imageUrl: '/demo/5.png',
			displayOrder: 5,
		},
		{
			name: 'Bể bơi cư dân',
			description: 'Bể bơi dành riêng cư dân',
			category: 'internal',
			iconName: 'waves',
			imageUrl: '/demo/6.png',
			displayOrder: 6,
		},
		{
			name: 'Bể sục',
			description: 'Khu vực thư giãn',
			category: 'internal',
			iconName: 'waves',
			imageUrl: '/demo/7.png',
			displayOrder: 7,
		},
		{
			name: 'Giặt sấy',
			description: 'Dịch vụ giặt sấy',
			category: 'internal',
			iconName: 'home',
			imageUrl: '/demo/8.png',
			displayOrder: 8,
		},
		{
			name: 'Games',
			description: 'Khu vui chơi giải trí',
			category: 'internal',
			iconName: 'gamepad2',
			imageUrl: '/demo/9.png',
			displayOrder: 9,
		},
		{
			name: 'Public lounge',
			description: 'Khu vực sinh hoạt chung',
			category: 'internal',
			iconName: 'users',
			imageUrl: '/demo/10.png',
			displayOrder: 10,
		},
		{
			name: 'Thư viện',
			description: 'Không gian đọc sách',
			category: 'internal',
			iconName: 'book-open',
			imageUrl: '/demo/1.png',
			displayOrder: 11,
		},
		{
			name: 'Coworking space',
			description: 'Không gian làm việc chung',
			category: 'internal',
			iconName: 'briefcase',
			imageUrl: '/demo/2.png',
			displayOrder: 12,
		},
		{
			name: 'Kids',
			description: 'Khu vui chơi trẻ em',
			category: 'internal',
			iconName: 'baby',
			imageUrl: '/demo/3.png',
			displayOrder: 13,
		},
		{
			name: 'Bể bơi Elite fitness',
			description: 'Bể bơi gym cao cấp',
			category: 'internal',
			iconName: 'waves',
			imageUrl: '/demo/4.png',
			displayOrder: 14,
		},
		{
			name: 'Sân dạo bộ',
			description: 'Lối đi bộ trong khu',
			category: 'internal',
			iconName: 'tree-pine',
			imageUrl: '/demo/5.png',
			displayOrder: 15,
		},
		{
			name: 'Rạp phim ngoài trời',
			description: 'Rạp chiếu phim ngoài trời',
			category: 'internal',
			iconName: 'camera',
			imageUrl: '/demo/6.png',
			displayOrder: 16,
		},
		{
			name: 'Bể bơi bốn mùa',
			description: 'Bể bơi hoạt động cả năm',
			category: 'internal',
			iconName: 'waves',
			imageUrl: '/demo/7.png',
			displayOrder: 17,
		},
		{
			name: 'Bể bơi ngoài trời',
			description: 'Bể bơi ngoài trời',
			category: 'internal',
			iconName: 'waves',
			imageUrl: '/demo/8.png',
			displayOrder: 18,
		},
	];

	const externalAmenities = [
		{
			name: 'CLB giải trí ven biển Sailing Club',
			description: 'Câu lạc bộ ven biển',
			category: 'external',
			iconName: 'anchor',
			imageUrl: '/demo/9.png',
			displayOrder: 1,
		},
		{
			name: 'Retail pods',
			description: 'Cửa hàng ngoài khu',
			category: 'external',
			iconName: 'shopping-bag',
			imageUrl: '/demo/10.png',
			displayOrder: 2,
		},
		{
			name: 'Hồ bơi trong nhà',
			description: 'Bể bơi trong nhà',
			category: 'external',
			iconName: 'waves',
			imageUrl: '/demo/1.png',
			displayOrder: 3,
		},
		{
			name: 'Nhà hàng',
			description: 'Nhà hàng khu ngoại',
			category: 'external',
			iconName: 'utensils',
			imageUrl: '/demo/2.png',
			displayOrder: 4,
		},
		{
			name: 'Khu tác phẩm nghệ thuật',
			description: 'Triển lãm nghệ thuật',
			category: 'external',
			iconName: 'palette',
			imageUrl: '/demo/3.png',
			displayOrder: 5,
		},
		{
			name: 'Quảng trường biển',
			description: 'Quảng trường ven biển',
			category: 'external',
			iconName: 'building',
			imageUrl: '/demo/4.png',
			displayOrder: 6,
		},
		{
			name: 'Cầu cảnh quan',
			description: 'Cầu ngắm cảnh',
			category: 'external',
			iconName: 'building',
			imageUrl: '/demo/5.png',
			displayOrder: 7,
		},
		{
			name: 'Trung tâm thương mại',
			description: 'Khu mua sắm lớn',
			category: 'external',
			iconName: 'shopping-bag',
			imageUrl: '/demo/6.png',
			displayOrder: 8,
		},
		{
			name: 'Hồ bơi ngoài trời',
			description: 'Bể bơi ngoài khu',
			category: 'external',
			iconName: 'waves',
			imageUrl: '/demo/7.png',
			displayOrder: 9,
		},
		{
			name: 'Pool bar',
			description: 'Quầy bar bể bơi',
			category: 'external',
			iconName: 'coffee',
			imageUrl: '/demo/8.png',
			displayOrder: 10,
		},
		{
			name: 'Khu BBQ',
			description: 'Khu nướng BBQ',
			category: 'external',
			iconName: 'utensils',
			imageUrl: '/demo/9.png',
			displayOrder: 11,
		},
		{
			name: 'Rạp chiếu phim ngoài trời',
			description: 'Rạp phim ngoài khu',
			category: 'external',
			iconName: 'camera',
			imageUrl: '/demo/10.png',
			displayOrder: 12,
		},
		{
			name: 'Hí trường biển',
			description: 'Nhà hát ven biển',
			category: 'external',
			iconName: 'music',
			imageUrl: '/demo/1.png',
			displayOrder: 13,
		},
		{
			name: 'Hồ nhạc nước',
			description: 'Đài phun nước nhạc',
			category: 'external',
			iconName: 'music',
			imageUrl: '/demo/2.png',
			displayOrder: 14,
		},
	];

	// Create amenities
	const allAmenities = [...internalAmenities, ...externalAmenities];

	for (const amenityData of allAmenities) {
		// Check if amenity already exists
		const existingAmenity = await prisma.amenity.findFirst({
			where: {
				name: amenityData.name,
				category: amenityData.category,
			},
		});

		if (!existingAmenity) {
			await prisma.amenity.create({
				data: amenityData,
			});
		}
	}

	// Update the sample tour with apartment metadata
	await prisma.virtualTour.update({
		where: { id: sampleTour.id },
		data: {
			apartmentMetadata: {
				type: {
					id: 'studio',
					name: 'Studio',
					unitCount: 1496,
					areaRange: '29.2 - 35 m²',
					description: 'Căn hộ studio hiện đại',
					hasSubLevels: false,
					expectedHotspots: ['Phòng khách', 'Toilet'],
				},
				specifications: {
					bedrooms: 0,
					bathrooms: 1,
					area: 32,
					floor: '15',
					view: 'City View',
					balcony: true,
				},
			},
		},
	});

	console.log('✅ Amenities seeded successfully!');
	console.log(`   Internal amenities: ${internalAmenities.length}`);
	console.log(`   External amenities: ${externalAmenities.length}`);
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
