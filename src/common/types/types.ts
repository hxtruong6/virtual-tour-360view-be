import { type ColumnType, type Generated } from 'kysely';
import { type Socket } from 'socket.io';

import { type TUser } from '../../core/entities/user-old.entity';
import { type EOrder } from '../constants/order';

export type StripGenerated<T> = {
	[K in keyof T]: T[K] extends Generated<infer U> ? U : T[K];
};

export type Timestamp = ColumnType<Date, Date | string>;

export interface IModifiedBy {
	createdBy: string | null;
	updatedBy: string | null;
	deletedBy: string | null;
}

export interface IPagination {
	offset: number;
	limit: number;
}

export interface IDBParams extends IPagination {
	orderBy?: string;
	order?: EOrder;
	search?: string;
	searchBy?: string;
	filter?: Record<string, unknown>;
}

export interface IDBReturn<T> {
	items: T[];
	total: number; // total items
}

export interface IGeocodeAddress {
	address: string;
	location: {
		lat: number;
		lng: number;
	};
}

export interface ISocketWithUser extends Socket {
	user?: TUser;
}

export interface IInventoryItemRef {
	// inventory id
	id?: string;
	// shop item id
	itemId?: string;
	code: string;
	quantity: number;
	userId: string;
}
