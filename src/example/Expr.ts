import { Lit, Token, Integer, Accept, Require } from "../Parser";
import { Return, Parser } from "../Core";

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

export const num = Token(Integer).map(x => new Num(x));
export const expr = num;
export const parenthesis = Accept("(").second(expr).first(Require(")"));
export const factor: Parser<Expr> = parenthesis.or(num);
export const term_: (left: Expr) => Parser<Expr> = (left: Expr) => 
	Token(Lit("*")).second(Return((a: number, b: number) => a*b))
	.or(Token(Lit("/")).second(Return((a: number, b: number) => a/b)))
	.then(factor).bind(([op, right]) => term_(new Operation(op, left, right)))
	.or(Return(left));

export const term: Parser<Expr> = factor.bind(term_);
