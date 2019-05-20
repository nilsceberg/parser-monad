import { Lit, Token, Integer, Accept, Require } from "../Parser";
import { Return, Parser } from "../Core";
import { StringSource, SourcePointer } from "../Source";

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

export function term_(): (left: Expr) => Parser<Expr> {
	return (left: Expr) => 
	Token(Lit("*")).second(Return((a: number, b: number) => a*b))
	.or(Token(Lit("/")).second(Return((a: number, b: number) => a/b)))
	.then(factor()).bind(([op, right]) => term_()(new Operation(op, left, right)))
	.or(Return(left));
}

export function term(): Parser<Expr> {
	return factor().bind(term_());
}

export function expr_(): (left: Expr) => Parser<Expr>{
	return (left: Expr) => 
		Token(Lit("+")).second(Return((a: number, b: number) => a+b))
		.or(Token(Lit("-")).second(Return((a: number, b: number) => a-b)))
		.then(term()).bind(([op, right]) => expr_()(new Operation(op, left, right)))
		.or(Return(left));
}

export const expr: Parser<Expr> = term().bind(expr_());
