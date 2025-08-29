import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Transaction } from 'kysely';

import { IDataServices } from '../../core/abstract';
import { IAdminRepository } from '../../core/domain/admin.repository.interface';
import { ITransaction } from '../../core/domain/transaction.interface';
import { Database, Tables } from '../../infrastructure/database/database';

@Injectable()
export class KyselyDataServices
	implements IDataServices, OnApplicationBootstrap
{
	transaction!: ITransaction;

	admins!: IAdminRepository;

	// Database here is postgresql with kysely. It could be any other database with any other ORM/query builder
	constructor(private readonly db: Database) {}

	onApplicationBootstrap() {
		this.transaction = {
			execute: async <T>(
				callback: (trx: Transaction<Tables>) => Promise<T>,
			) => {
				return this.db.transaction().execute((trx) => {
					return callback(trx);
				});
			},
		};

		// this.admins = new AdminRepository(this.db);
	}
}
