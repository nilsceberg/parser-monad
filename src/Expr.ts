import { Lit, Token, Integer, Accept, Require } from "./Parser";
import { Return, Parser } from "./Core";
import { StringSource, SourcePointer } from "./Source";

// This should be fairly self-explanatory: a recursive left-associative
// parser builder.
export function leftAssoc<T>(
	ops: { [sym: string]: ((a: T, b: T) => T) },
	right: () => (left: T) => Parser<T>,
	operand: Parser<T>,
): (left: T) => Parser<T> {
	return (left: T) => {
		const parsers: Parser<(a: T, b: T) => T>[] = [];
		for (let sym in ops) {
			parsers.push(Accept(sym).second(Return(ops[sym])));
		}
		return Parser.orMany(parsers)
			.then(operand).bind(([op, right_]) => right()(op(left, right_)))
			.or(Return(left));
	};
}

export function exprParser<T>(
	ops: { [sym: string]: ((a: T, b: T) => T) }[],
	literals: Parser<T>[]
): Parser<T> {
	// This is kind of a mess, so hold on tight:
	// We initialize a separate top variable, which will eventually hold the
	// top level expression parser and let the bottom level parser access that
	// via its closure.
	let top: Parser<T> = null;

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
		function right(): (left: T) => Parser<T> {
			return leftAssoc<T>(levelOps, right, operand);
		}

		// We start with left-most operand, then the recursive right side.
		level = operand.bind(right());
	}

	// Set the top level parser (so that the bottom level parser can use it)
	// and return it.
	top = level;
	return level;
}

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
	op: (l: any, r: any) => any;

	constructor(op: (l: any, r: any) => any, left: Expr, right: Expr) {
		super();
		this.op = op;
		this.left = left;
		this.right = right;
	}

	evaluate(): any {
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

export const parenthesis: Parser<Expr> = Parser.lazy(() =>
	Accept("(").second(expr).first(Require(")"))
);


const op: (f: (x: number, y: number) => number) => (left: Expr, right: Expr) => Expr =
	f => (left: Expr, right: Expr) => new BinaryOperation(f, left, right);

export const builtExpr = exprParser(
	[{
		"*": op((a, b) => a * b),
		"/": op((a, b) => a / b),
	}, {
		"+": op((a, b) => a + b),
		"-": op((a, b) => a - b),
	}],
	[num]
);

export const factor: Parser<Expr> =
	parenthesis.or(num);

export function term_(): (left: Expr) => Parser<Expr> {
	return leftAssoc({
		"*": op((a, b) => a * b),
		"/": op((a, b) => a / b),
	}, term_, factor);
}

export const term: Parser<Expr> =
	factor.bind(term_());

export function expr_(): (left: Expr) => Parser<Expr>{
	return leftAssoc({
		"+": op((a, b) => a + b),
		"-": op((a, b) => a - b),
	}, expr_, term);
}

export const expr: Parser<Expr> =
	term.bind(expr_());
