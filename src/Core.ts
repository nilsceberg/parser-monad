import { SourcePointer, char } from "./Source";
import { Maybe } from "./Maybe";

export type ParserResult<T> = Maybe<[T, SourcePointer]>;
export type ParserFunction<T> = (p: SourcePointer) => ParserResult<T>;

export class Parser<T> {
	f: ParserFunction<T>;

	constructor(f: ParserFunction<T>) {
		this.f = f;
	}

	parse(source: SourcePointer): ParserResult<T> {
		return this.f(source);
	}

	matches(pred: (v: T) => boolean): Parser<T> {
		return new Parser(s => {
			let result = this.parse(s);
			if (result.isJust()) {
				const [v, r] = result.from();
				if (!pred(v)) {
					result = Maybe.nothing();
				}
			}
			return result;
		});
	}

	or(other: Parser<T>): Parser<T> {
		return new Parser(s => {
			let result = this.parse(s);
			if (!result.isJust()) {
				result = other.parse(s);
			}
			return result;
		});
	}

	repeat(n: number = -1): Parser<T[]> {
		return new Parser(s => {
			let result: ParserResult<T>;
			const values: T[] = [];
			while (n--) {
				result = this.parse(s);
				if (!result.isJust()) {
					break;
				}

				const [value, s_] = result.from();
				values.push(value);
				s = s_;
			}
			return Maybe.just([values, s]);
		});
	}

	map<U>(f: (v: T) => U): Parser<U> {
		return new Parser<U>(s => {
			return this.parse(s).map(([v, r]) => [f(v), r]);
		});
	}

	first<U>(other: Parser<U>): Parser<T> {
		return new Parser<T>(s => {
			/*
			TODO: bind combinator
			return this.parse(s).map(
				([v, s]) => other.parse(s).map(
					([_, s]) => [v, s]));
					*/

			let result = this.parse(s);
			if (!result.isJust()) return Maybe.nothing();
			
			const [value, s_] = result.from();
			const result_ = other.parse(s_);
			if (!result_.isJust()) return Maybe.nothing();
			
			const [_ , s__] = result_.from();
			return Maybe.just([value, s__]);
		});
	}

	second<U>(other: Parser<U>): Parser<U> {
		return new Parser<U>(s => {
			let result = this.parse(s);
			if (!result.isJust()) return Maybe.nothing();
			
			const [_, s_] = result.from();
			const result_ = other.parse(s_);
			if (!result_.isJust()) return Maybe.nothing();
			
			const [value, s__] = result_.from();
			return Maybe.just([value, s__]);
		});
	}
	
	then<U>(other: Parser<U>): Parser<[T, U]> {
		return new Parser<[T, U]>(s => {
			const result1 = this.parse(s);
			if (!result1.isJust()) return Maybe.nothing();
			const [t, s_] = result1.from();

			const result2 = other.parse(s_);
			if (!result2.isJust()) return Maybe.nothing();
			const [u, s__] = result2.from();

			return Maybe.just([[t, u], s__]);
		});
	}
}

export const Return = <T>(x: T) => new Parser<T>(s => Maybe.just([x, s]));
export const Fail = new Parser<any>(s => Maybe.nothing());
export const Character: Parser<char> = new Parser<char>(s => Maybe.just([s.first(), s.rest()]));
