import { type Transaction } from 'kysely';

import { type Tables } from '../../infrastructure/database/database';

// Extend IGenericRepository to add domain-specific methods
export interface ITransaction {
	execute: <T>(
		callback: (trx: Transaction<Tables>) => Promise<T>,
	) => Promise<T>;
}
