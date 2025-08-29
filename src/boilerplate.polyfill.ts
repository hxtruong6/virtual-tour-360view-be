/* eslint-disable canonical/no-use-extend-native */
import 'source-map-support/register';

declare global {
	export type Uuid = string & { _uuidBrand: undefined };
}
