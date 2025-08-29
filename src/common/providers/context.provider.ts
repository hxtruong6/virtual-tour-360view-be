import { ClsServiceManager } from 'nestjs-cls';

import { type TUser } from '../../core/entities/user.entity';
import { type LanguageCode } from '../constants';

export class ContextProvider {
	private static readonly nameSpace = 'request';

	private static readonly authUserKey = 'user_key';

	private static readonly languageKey = 'language_key';

	private static get<T>(key: string) {
		const store = ClsServiceManager.getClsService();

		return store.get<T>(ContextProvider.getKeyWithNamespace(key));
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private static set(key: string, value: any): void {
		const store = ClsServiceManager.getClsService();

		store.set(ContextProvider.getKeyWithNamespace(key), value);
	}

	private static getKeyWithNamespace(key: string): string {
		return `${ContextProvider.nameSpace}.${key}`;
	}

	static setAuthUser(user: TUser): void {
		ContextProvider.set(ContextProvider.authUserKey, user);
	}

	static setLanguage(language: string): void {
		ContextProvider.set(ContextProvider.languageKey, language);
	}

	static getLanguage(): LanguageCode | undefined {
		return ContextProvider.get<LanguageCode>(ContextProvider.languageKey);
	}

	static getAuthUser(): TUser | undefined {
		return ContextProvider.get<TUser>(ContextProvider.authUserKey);
	}
}
