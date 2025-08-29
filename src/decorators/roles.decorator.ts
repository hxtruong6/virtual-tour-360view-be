import { SetMetadata } from '@nestjs/common';

import { type EAdminRoleType } from '../common/constants';

// export const Roles = Reflector.createDecorator<string[]>();
// eslint-disable-next-line @typescript-eslint/naming-convention
export const Roles = (roles: EAdminRoleType[]) => SetMetadata('roles', roles);
