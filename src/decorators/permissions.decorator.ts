import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Permissions = (permissions: string[]) =>
	SetMetadata(PERMISSIONS_KEY, permissions);
