import { SourcePointer, char } from "./Source";

export type ParserResult<T> = [T, SourcePointer];
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

export const Character = new Parser<char>(s => [s.first(), s.rest()]);
