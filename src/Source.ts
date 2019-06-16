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
	private line: number;

	constructor(source: Source, index: number = 0, line: number = 1) {
		this.source = <StringSource>source;
		this.index = index;
		this.line = line;

		if (this.source.s[index] === '\n') this.line++;
	}

	equals(s: string): boolean {
		return this.source.s.substr(this.index) === s;
	}

	toString(): string {
		return `line ${this.line}: ${this.source.s.substr(this.index)}`;
	}

	first(): char {
		return this.source.s[this.index];
	}

	lookahead(n: number): string {
		return this.source.s.substr(this.index, n);
	}

	rest(): SourcePointer {
		return new SourcePointer(this.source, this.index + 1, this.line);
	}

	length(): number {
		return this.source.s.length - this.index;
	}
}
