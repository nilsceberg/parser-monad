export abstract class Maybe<T> {
	// This way of implementing or is pretty, but probably not suited for
	// a language without lazy evaluation. (Implement lazy evaluation?)
	abstract or(other: Maybe<T>): Maybe<T>;
	abstract from(): T;
	abstract isJust(): boolean;
	abstract map(f: (v: T) => T): Maybe<T>;

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

	map(f: (v: T) => T): Maybe<T> {
		return Maybe.just(f(this.value));
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

	map(f: (v: T) => T): Maybe<T> {
		return this;
	}
}
