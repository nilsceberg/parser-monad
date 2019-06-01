import { Lit, Token, Integer, Accept, Require } from "./Parser";
import { Return, Parser } from "./Core";
import { StringSource, SourcePointer } from "./Source";

export abstract class Expr {
	abstract evaluate(): any;
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

export class BinaryOperation extends Expr {
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

// This should be fairly self-explanatory: a recursive left-associative
// parser builder.
export function leftAssoc(
	ops: { [sym: string]: ((a: any, b: any) => any) },
	right: () => (left: Expr) => Parser<Expr>,
	operand: Parser<Expr>,
): (left: Expr) => Parser<Expr> {
	return (left: Expr) => {
		const parsers: Parser<(a: any, b: any) => any>[] = [];
		for (let sym in ops) {
			parsers.push(Accept(sym).second(Return(ops[sym])));
		}
		return Parser.orMany(parsers)
			.then(operand).bind(([op, right_]) => right()(new BinaryOperation(op, left, right_)))
			.or(Return(left));
	};
}

const id = (x: any) => x
const negate = (x: number) => -x

export const sign =
	Token(Lit("-")).map(_ => negate)
	.or(Token(Lit("+")).map(_ => id))
	.or(Return(id));

export const num =
	sign.bind(f => Token(Integer).map(x => new Num(f(x))));

export const parenthesis: Parser<Expr> = Parser.lazy(() =>
	Accept("(").second(expr).first(Require(")"))
);

export function exprParser(
	ops: { [sym: string]: ((a: any, b: any) => any) }[],
	literals: Parser<Expr>[]
): Parser<Expr> {
	// This is kind of a mess, so hold on tight:
	// We initialize a separate top variable, which will eventually hold the
	// top level expression parser and let the bottom level parser access that
	// via its closure.
	let top: Parser<Expr> = null;

	// The bottom level parser parses parentheses with the top level parser
	// inside of them, or a literal
	let level = Parser.lazy(() =>
			Accept("(").second(top).first(Require(")"))
			.or(Parser.orMany(literals))
		);

	// Then, each level (with the operators in ops) depends on the previous one.
	for (const levelOps of ops) {
		// The operand variable stores the previous level for the closure of
		// of the "right" function, which uses the leftAssoc helper to construct
		// a left-associative parser recursively.
		const operand = level;
		function right(): (left: Expr) => Parser<Expr> {
			return leftAssoc(levelOps, right, operand);
		}

		// We start with left-most operand, then the recursive right side.
		level = operand.bind(right());
	}

	// Set the top level parser (so that the bottom level parser can use it)
	// and return it.
	top = level;
	return level;
}

export const builtExpr = exprParser(
	[{
		"+": (a, b) => a + b,
		"-": (a, b) => a - b,
	}, {
		"*": (a, b) => a * b,
		"/": (a, b) => a / b,
	}],
	[num]
);

export const factor: Parser<Expr> =
	parenthesis.or(num);

export function term_(): (left: Expr) => Parser<Expr> {
	return leftAssoc({
		"*": (a, b) => a * b,
		"/": (a, b) => a / b,
	}, term_, factor);
}

export const term: Parser<Expr> =
	factor.bind(term_());

export function expr_(): (left: Expr) => Parser<Expr>{
	return leftAssoc({
		"+": (a, b) => a + b,
		"-": (a, b) => a - b,
	}, expr_, term);
}

export const expr: Parser<Expr> =
	term.bind(expr_());
