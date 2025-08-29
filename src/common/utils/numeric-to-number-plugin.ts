/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	type KyselyPlugin,
	type PluginTransformQueryArgs,
	type PluginTransformResultArgs,
	type RootOperationNode,
} from 'kysely';

// Fields in VoucherTable to convert from string to number
const NUMERIC_FIELDS = [
	'value',
	'usageCount',
	'maxUsageCount',
	'maxUsers',
] as const;

export class NumericToNumberPlugin implements KyselyPlugin {
	transformQuery(args: PluginTransformQueryArgs): RootOperationNode {
		return args.node;
	}

	async transformResult(args: PluginTransformResultArgs): Promise<any> {
		const { result } = args;

		// Handle single-row results (e.g., selectTakeFirst)
		if (!Array.isArray(result) && result && typeof result === 'object') {
			return this.transformRow(result);
		}

		// Handle multi-row results (e.g., select)
		if (Array.isArray(result)) {
			return result.map((row) => this.transformRow(row));
		}

		return result;
	}

	private transformRow(row: any): any {
		const transformed = { ...row };

		for (const field of NUMERIC_FIELDS) {
			if (field in transformed && typeof transformed[field] === 'string') {
				transformed[field] = Number(transformed[field]);
			}
		}

		return transformed;
	}
}
