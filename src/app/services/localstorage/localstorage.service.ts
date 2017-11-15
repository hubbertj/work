import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorageService {
	constructor () {};

	public setItem (key, value) {
		return localStorage.setItem(key, value);
	};

	public getItem (key) {
		return localStorage.getItem(key);
	};

	public clearItem(key) {
		localStorage.removeItem(key);
	};
}
