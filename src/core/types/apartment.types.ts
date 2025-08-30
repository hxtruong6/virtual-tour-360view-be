/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */
/**
 * Apartment type definitions for virtual tours
 */
export interface IApartmentType {
	id: string;
	name: string;
	unitCount: number;
	areaRange: string;
	description: string;
	hasSubLevels: boolean;
	subLevels?: string[];
	expectedHotspots: string[];
}

export interface IApartmentSpecifications {
	bedrooms: number;
	bathrooms: number;
	area: number; // in square meters
	floor?: string;
	view?: string;
	balcony?: boolean;
	furnished?: boolean;
	orientation?: string; // 'north', 'south', 'east', 'west', etc.
}

export interface IApartmentMetadata {
	type: IApartmentType;
	specifications?: IApartmentSpecifications;
}

/**
 * Common room type constants
 */
const ROOM_TYPES = {
	PHONG_KHACH: 'Phòng khách',
	TOILET: 'Toilet',
	PHONG_NGU: 'Phòng ngủ',
	NHA_BEP: 'Nhà bếp',
	LOI_DI_CHUNG: 'Lối đi chung',
} as const;

/**
 * Predefined apartment types
 */
export const APARTMENT_TYPES: Record<string, IApartmentType> = {
	Studio: {
		id: 'studio',
		name: 'Studio',
		unitCount: 1496,
		areaRange: '29.2 - 35 m²',
		description: 'Căn hộ studio hiện đại',
		hasSubLevels: false,
		expectedHotspots: ['Phòng khách', 'Toilet'],
	},
	OneBedroom: {
		id: '1pn',
		name: '1PN',
		unitCount: 486,
		areaRange: '47.3 - 72.1 m²',
		description: 'Căn hộ 1 phòng ngủ',
		hasSubLevels: false,
		expectedHotspots: ['Phòng ngủ', 'Phòng khách', 'Toilet'],
	},
	TwoBedroom: {
		id: '2pn',
		name: '2PN',
		unitCount: 204,
		areaRange: '70.6 - 89.0 m²',
		description: 'Căn hộ 2 phòng ngủ',
		hasSubLevels: false,
		expectedHotspots: [
			'Phòng ngủ 1',
			'Phòng ngủ 2',
			'Toilet 1',
			'Toilet 2',
			'Phòng khách',
		],
	},
	ThreeBedroom: {
		id: '3pn',
		name: '3PN',
		unitCount: 120,
		areaRange: '92.6 - 113.1 m²',
		description: 'Căn hộ 3 phòng ngủ',
		hasSubLevels: false,
		expectedHotspots: [
			'Phòng ngủ 1',
			'Phòng ngủ 2',
			'Phòng ngủ 3',
			'Toilet 1',
			'Toilet 2',
			'Phòng khách',
			'Nhà bếp',
		],
	},
	SV: {
		id: 'sv',
		name: 'Sky Villa',
		unitCount: 8,
		areaRange: '305.8 - 325.4 m²',
		description: 'Sky Villa cao cấp',
		hasSubLevels: true,
		subLevels: ['SV Trệt', 'SV Lầu'],
		expectedHotspots: [
			'Phòng ngủ 1',
			'Toilet 1',
			'Phòng khách',
			'Phòng ngủ 2',
			'Toilet 2',
			'Phòng ngủ 3',
			'Toilet 3',
			'Lối đi chung',
			'Phòng ngủ 4',
		],
	},
};

/**
 * Gallery categories for media filtering
 */
export const GALLERY_CATEGORIES = {
	AERIAL_VIEWS: 'aerial-views',
	DAYLIGHT_VIEWS: 'daylight-views',
	EVENING_NIGHT: 'evening-night',
	FACILITIES_AMENITIES: 'facilities-amenities',
	GALLERY_COLLECTION: 'gallery-collection',
} as const;

export type GalleryCategoryType =
	(typeof GALLERY_CATEGORIES)[keyof typeof GALLERY_CATEGORIES];

/**
 * Amenity categories
 */
export const AMENITY_CATEGORIES = {
	INTERNAL: 'internal',
	EXTERNAL: 'external',
} as const;

export type AmenityCategoryType =
	(typeof AMENITY_CATEGORIES)[keyof typeof AMENITY_CATEGORIES];
