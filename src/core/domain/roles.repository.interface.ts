import {
	type TCreateRolePermission,
	type TRole,
	type TRolePermissionDetail,
} from '../entities/permission.entity';

export interface IRolesRepository {
	create(role: TRole): Promise<TRole>;

	getAll(params?: { id?: Uuid; name?: string }): Promise<TRole[]>;

	getById(id: Uuid): Promise<TRole | undefined>;

	getByName(name: string): Promise<TRole | undefined>;

	update(id: Uuid, role: TRole): Promise<void>;

	getRolePermissions(roleId: Uuid): Promise<TRolePermissionDetail[]>;

	deleteRolePermissions(roleId: Uuid): Promise<void>;

	createRolePermission(rolePermission: TCreateRolePermission[]): Promise<void>;
}
