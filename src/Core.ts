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
}

export const Return = <T>(x: T) => new Parser<T>(s => Maybe.just([x, s]));
export const Fail = new Parser<any>(s => Maybe.nothing());
export const Character: Parser<char> = new Parser<char>(s => Maybe.just([s.first(), s.rest()]));
