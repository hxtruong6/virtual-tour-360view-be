import { type IAdminRepository } from '../domain/admin.repository.interface';
import { type ITransaction } from '../domain/transaction.interface';

// IDataServices should now expose IUsersRepository, which extends IGenericRepository
export abstract class IDataServices {
	abstract transaction: ITransaction;

	abstract admins: IAdminRepository;
}
