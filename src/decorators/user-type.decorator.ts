import { SetMetadata } from '@nestjs/common';

import { type EUserType } from '../common/constants';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const UserTypes = (userTypes: EUserType[]) =>
	SetMetadata('userTypes', userTypes);
// export const UserTypes = Reflector.createDecorator<EUserType[]>();
