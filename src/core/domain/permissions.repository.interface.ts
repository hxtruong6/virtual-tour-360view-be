import { type TPermission } from '../entities/permission.entity';

export interface IPermissionsRepository {
	create(permission: TPermission): Promise<TPermission>;

	getAll(): Promise<TPermission[]>;
}
