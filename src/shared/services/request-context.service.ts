// eslint-disable-next-line n/no-unsupported-features/node-builtins
import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

@Injectable()
export class RequestContextService {
	private asyncLocalStorage = new AsyncLocalStorage<Map<string, unknown>>();

	run(callback: () => void, data: Record<string, unknown> = {}) {
		const store = new Map(Object.entries(data));
		this.asyncLocalStorage.run(store, callback);
	}

	set(key: string, value: unknown) {
		const store = this.asyncLocalStorage.getStore();

		if (store) {
			store.set(key, value);
		}
	}

	get<T>(key: string): T | undefined {
		const store = this.asyncLocalStorage.getStore();

		return store ? (store.get(key) as T) : undefined;
	}
}
