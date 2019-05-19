import { Parser, Character, Return, Fail, Error } from "./Core";
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

test("error parser", () => {
	expect(() => Error("error").parse(ptr))
		.toThrow("error at ?");
});

test("character parser", () => {
	const [value, rest] = Character.parse(ptr).from();
	expect(value).toStrictEqual("h");
	expect(rest.equals("ello")).toBeTruthy();
});

test("character parser EOF", () => {
	const source = new StringSource("");
	const ptr = new SourcePointer(source);

	expect(Character.parse(ptr).isJust()).toBeFalsy();
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

test("repeat combinator", () => {
	let [value, rest] = Character.repeat(3).parse(ptr).from();
	expect(value).toStrictEqual(["h", "e", "l"]);
	expect(rest.equals("lo")).toBeTruthy();

	[value, rest] = Character.matches(x => x === "h" || x === "e").repeat().parse(ptr).from();
	expect(value).toStrictEqual(["h", "e"]);
	expect(rest.equals("llo")).toBeTruthy();
});

test("map combinator", () => {
	let [value, rest] = Return(123).map(x => x * 2).parse(ptr).from();
	expect(value).toStrictEqual(246);
});

test("first combinator", () => {
	let [value, rest] = Character.first(Character).parse(ptr).from();
	expect(value).toStrictEqual("h");
	expect(rest.equals("llo")).toBeTruthy();
});

test("second combinator", () => {
	let [value, rest] = Character.second(Character).parse(ptr).from();
	expect(value).toStrictEqual("e");
	expect(rest.equals("llo")).toBeTruthy();
});

test("then combinator", () => {
	let [value, rest] = Character.then(Character).parse(ptr).from();
	expect(value).toStrictEqual(["h", "e"]);
	expect(rest.equals("llo")).toBeTruthy();
});

test("bind combinator", () => {
	let [value, rest] = Return(4).bind(n => Character.repeat(n)).parse(ptr).from();
	expect(value).toStrictEqual(["h", "e", "l", "l"]);
	expect(rest.equals("o")).toBeTruthy();
});
