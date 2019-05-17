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
}

export const Character = new Parser<char>(s => Maybe.just([s.first(), s.rest()]));
