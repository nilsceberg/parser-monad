export type char = string;

export interface Source {
}

export class StringSource {
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

	rest(): SourcePointer {
		return new SourcePointer(this._rest.substr(1));
	}
}
