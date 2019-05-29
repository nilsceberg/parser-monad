import { Lit, Token, Integer, Accept, Require } from "./Parser";
import { Return, Parser } from "./Core";
import { StringSource, SourcePointer } from "./Source";

export abstract class Expr {
	abstract evaluate(): number;
}

export class Num extends Expr {
	value: number;

	constructor(value: number) {
		super();
		this.value = value;
	}
	
	evaluate(): number {
		return this.value;
	}
}

export class Operation extends Expr {
	left: Expr;
	right: Expr;
	op: (l: number, r: number) => number;

	constructor(op: (l: number, r: number) => number, left: Expr, right: Expr) {
		super();
		this.op = op;
		this.left = left;
		this.right = right;
	}

	evaluate(): number {
		return this.op(this.left.evaluate(), this.right.evaluate());
	}
}

const id = (x: any) => x
const negate = (x: number) => -x

export const sign =
	Token(Lit("-")).map(_ => negate)
	.or(Token(Lit("+")).map(_ => id))
	.or(Return(id));

export const num =
	sign.bind(f => Token(Integer).map(x => new Num(f(x))));

export function parenthesis(): Parser<Expr> { 
	return Accept("(").second(expr).first(Require(")"));
}

export function factor(): Parser<Expr> {
	return parenthesis().or(num);
}

function leftAssoc(
	ops: { [sym: string]: ((a: number, b: number) => number) },
	right: () => (left: Expr) => Parser<Expr>,
	operand: () => Parser<Expr>,
): (left: Expr) => Parser<Expr> {
	return (left: Expr) => {
		const parsers: Parser<(a: number, b: number) => number>[] = [];
		for (let sym in ops) {
			parsers.push(Token(Lit(sym)).second(Return(ops[sym])));
		}
		return Parser.orMany(parsers)
			.then(operand()).bind(([op, right_]) => right()(new Operation(op, left, right_)))
			.or(Return(left));
	};
}

export function term_(): (left: Expr) => Parser<Expr> {
	return leftAssoc({
		"*": (a, b) => a * b,
		"/": (a, b) => a / b,
	}, term_, factor);
}

export function term(): Parser<Expr> {
	return factor().bind(term_());
}

export function expr_(): (left: Expr) => Parser<Expr>{
	return leftAssoc({
		"+": (a, b) => a + b,
		"-": (a, b) => a - b,
	}, expr_, term);
}

export const expr: Parser<Expr> = term().bind(expr_());
