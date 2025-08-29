import { type IAdminRepository } from '../../core/domain/admin.repository.interface';
import {
	type TAdmin,
	type TAdminInsert,
	type TAdminUpdate,
} from '../../core/entities/admin.entity';
import { type Database, DbSchema } from '../database/database';

export class AdminRepository implements IAdminRepository {
	constructor(private readonly db: Database) {}

	async getByUserId(userId: string): Promise<TAdmin | undefined> {
		return this.db
			.withSchema(DbSchema.app)
			.selectFrom('admins')
			.selectAll()
			.where('userId', '=', userId)
			.executeTakeFirst();
	}

	async getByUsername(username: string): Promise<TAdmin | undefined> {
		return this.db
			.withSchema(DbSchema.app)
			.selectFrom('admins')
			.selectAll()
			.where('username', '=', username)
			.executeTakeFirst();
	}

	getById(id: string): Promise<TAdmin | undefined> {
		return this.db
			.withSchema(DbSchema.app)
			.selectFrom('admins')
			.selectAll()
			.where('id', '=', id)
			.executeTakeFirst();
	}

	async create(data: TAdminInsert): Promise<TAdmin> {
		return this.db
			.withSchema(DbSchema.app)
			.insertInto('admins')
			.values({
				...data,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returningAll()
			.executeTakeFirst() as Promise<TAdmin>;
	}

	async update(id: string, data: TAdminUpdate): Promise<void> {
		await this.db
			.withSchema(DbSchema.app)
			.updateTable('admins')
			.set({
				...data,
				updatedAt: new Date(),
			})
			.where('id', '=', id)
			.execute();
	}
}
