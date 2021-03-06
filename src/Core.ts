import { SourcePointer, char } from "./Source";
import { Maybe } from "./Maybe";
import * as util from "util";

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

	static orMany<T>(ps: Parser<T>[]): Parser<T> {
		return new Parser(s => {
			let result: ParserResult<T> = Maybe.nothing();
			for (let p of ps) {
				result = p.parse(s);
				if (result.isJust()) break;
			}
			return result;
		});
	}

	repeat(n: number = -1): Parser<T[]> {
		return new Parser(s => {
			let i = n;
			let result: ParserResult<T>;
			const values: T[] = [];
			while (i--) {
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
	
	// Usage of bind may not be suitable (if chaining more than one) due to recursion.
	// Should implement a sequence for an array of transformations.
	bind<U>(parserFactory: (x: T) => Parser<U>): Parser<U> {
		return new Parser<U>(s => {
			const result = this.parse(s);
			if (!result.isJust()) return Maybe.nothing();
			const [x, s_] = result.from();

			return parserFactory(x).parse(s_);
		});
	}

	// Again, these implementations are beautiful and much simpler than their predecessors,
	// but if recursion is an issue, try restoring their old versions
	// (commit "Simplify first, second, and bind combinators").
	first<U>(other: Parser<U>): Parser<T> {
		return this.bind(result => other.map(() => result));
	}

	second<U>(other: Parser<U>): Parser<U> {
		return this.bind(() => other);
	}
	
	then<U>(other: Parser<U>): Parser<[T, U]> {
		return this.bind(x => other.map(y => [x, y]));
	}

	static lazy<T>(factory: () => Parser<T>): Parser<T> {
		return new Parser<T>(s => {
			return factory().parse(s);
		});
	}
}

export const Return = <T>(x: T) => new Parser<T>(s => Maybe.just([x, s]));
export const Fail = new Parser<any>(s => Maybe.nothing());
export const Error = (message: string) => new Parser<any>(s => {
	throw(`${message} at ? near ${s.toString()}`);
});

export const RawCharacter: Parser<char> =
	new Parser<char>(s => Maybe.just([s.first(), s.rest()]))
	.matches(c => c !== undefined);

export const Lookahead: (n: number) => Parser<string> = n =>
	new Parser<string>(s => Maybe.just([s.lookahead(n), s]))
	.matches(s => s.length === n);
