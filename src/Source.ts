export type char = string;

export interface Source {
}

export class StringSource implements Source {
	s: string;

	constructor(s: string) {
		this.s = s;
	}
}

export class SourcePointer {
	private source: StringSource;
	private index: number;

	constructor(source: Source, index: number = 0) {
		this.source = <StringSource>source;
		this.index = index;
	}

	equals(s: string): boolean {
		return this.toString() == s;
	}

	toString(): string {
		return this.source.s.substr(this.index);
	}

	first(): char {
		return this.source.s[this.index];
	}

	lookahead(n: number): string {
		return this.source.s.substr(this.index, n);
	}

	rest(): SourcePointer {
		return new SourcePointer(this.source, this.index + 1);
	}

	length(): number {
		return this.source.s.length - this.index;
	}
}
