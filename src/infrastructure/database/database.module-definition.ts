import { ConfigurableModuleBuilder } from '@nestjs/common';

import { type IDatabaseOptions } from './database-option';

export const {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	ConfigurableModuleClass: ConfigurableDatabaseModule,
	MODULE_OPTIONS_TOKEN: DATABASE_OPTIONS,
} = new ConfigurableModuleBuilder<IDatabaseOptions>()
	.setClassMethodName('forRoot')
	.build();
