import {
	type TAdmin,
	type TAdminInsert,
	type TAdminUpdate,
} from '../entities/admin.entity';

export interface IAdminRepository {
	getByUserId(userId: string): Promise<TAdmin | undefined>;
	getByUsername(username: string): Promise<TAdmin | undefined>;
	getById(id: string): Promise<TAdmin | undefined>;
	create(data: TAdminInsert): Promise<TAdmin>;
	update(id: string, data: TAdminUpdate): Promise<void>;
}
