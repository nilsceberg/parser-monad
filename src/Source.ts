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
	private _rest: string;

	constructor(source: Source | string) {
		if (typeof source === "string") {
			this._rest = source;
		}
		else {
			this._rest = (<StringSource>source).s;
		}
	}

	equals(s: string): boolean {
		return this._rest == s;
	}

	first(): char {
		return this._rest[0];
	}

	lookahead(n: number): string {
		return this._rest.substr(0, n);
	}

	rest(): SourcePointer {
		return new SourcePointer(this._rest.substr(1));
	}

	length(): number {
		return this._rest.length;
	}
}
