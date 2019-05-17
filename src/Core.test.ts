import { Parser, Character, Return, Fail } from "./Core";
import { StringSource, SourcePointer, char } from "./Source";

const source = new StringSource("hello");
const ptr = new SourcePointer(source);

test("return parser", () => {
	const [value, rest] = Return(123).parse(ptr).from();
	expect(value).toStrictEqual(123);
	expect(rest.equals("hello")).toBeTruthy();
});

test("fail parser", () => {
	const result = Fail.parse(ptr);
	expect(result.isJust()).toBeFalsy();
});

test("character parser", () => {
	const [value, rest] = Character.parse(ptr).from();
	expect(value).toStrictEqual("h");
	expect(rest.equals("ello")).toBeTruthy();
});

test("matches combinator", () => {
	expect(Character.matches(x => x === "e").parse(ptr).isJust()).toBeFalsy();

	const [value, rest] = Character.matches(x => x === "h").parse(ptr).from();
	expect(value).toStrictEqual("h");
	expect(rest.equals("ello")).toBeTruthy();
});

test("or combinator", () => {
	const a = Return(5);
	const b = Return(13);
	b.parse = jest.fn();
	const c = Fail;
	const d = Return(22);
	const e = Fail;

	let [value, rest] = a.or(b).parse(ptr).from();
	expect(value).toStrictEqual(5);
	expect(b.parse).not.toHaveBeenCalled();

	[value, rest] = c.or(d).parse(ptr).from();
	expect(value).toStrictEqual(22);

	expect(c.or(e).parse(ptr).isJust()).toBeFalsy();
});
