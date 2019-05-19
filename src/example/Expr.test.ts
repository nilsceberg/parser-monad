import { StringSource, SourcePointer } from "../Source";
import { parenthesis, Num, term, factor } from "./Expr";
import { conditionalExpression } from "@babel/types";

test("parentheses", () => {
	const source = new StringSource("(123)");
	const ptr = new SourcePointer(source);

	const [result, rest] = parenthesis.parse(ptr).from();
	expect(result).toStrictEqual(new Num(123));
});

test("parentheses2", () => {
	const source1 = new StringSource("123");
	const ptr1 = new SourcePointer(source1);
	const [result1, rest1] = factor.parse(ptr1).from();
	expect(result1).toStrictEqual(new Num(123));

	const source2 = new StringSource("(123)");
	const ptr2 = new SourcePointer(source2);
	const [result2, rest2] = parenthesis.parse(ptr2).from();
	expect(result2).toStrictEqual(new Num(123));
});

test("term", () => {
	const source = new StringSource("3*4/2*2");
	const ptr = new SourcePointer(source);
	const [result, rest] = term.parse(ptr).from();
	expect(result.evaluate()).toStrictEqual(12);

	//const source2 = new StringSource("3*4/(2*2)");
	const source2 = new StringSource("3*4/(2*2)");
	const ptr2 = new SourcePointer(source2);
	const [result2, rest2] = term.parse(ptr2).from();
	expect(result2.evaluate()).toStrictEqual(12);
});
