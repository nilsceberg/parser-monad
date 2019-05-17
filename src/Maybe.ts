export abstract class Maybe<T> {
	// This way of implementing or is pretty, but probably not suited for
	// a language without lazy evaluation. (Implement lazy evaluation?)
	abstract or(other: Maybe<T>): Maybe<T>;
	abstract from(): T;
	abstract isJust(): boolean;

	static just<T>(value: T): Maybe<T> {
		return new Just<T>(value);
	}

	static nothing<T>(): Maybe<T> {
		return new Nothing<T>();
	}
}

class Just<T> implements Maybe<T> {
	value: T;

	constructor(value: T) {
		this.value = value;
	}

	or(other: Maybe<T>): Maybe<T> {
		return this;
	}

	from(): T {
		return this.value;
	}

	isJust(): boolean {
		return true;
	}
}

class Nothing<T> implements Maybe<T> {
	or(other: Maybe<T>): Maybe<T> {
		return other;
	}

	from(): T {
		throw "Nothing";
	}

	isJust(): boolean {
		return false;
	}
}
