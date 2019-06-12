import { Parser, RawCharacter, Return, Fail, Error } from "./Core";
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

test("RawCharacter parser", () => {
	const [value, rest] = RawCharacter.parse(ptr).from();
	expect(value).toStrictEqual("h");
	expect(rest.equals("ello")).toBeTruthy();
});

test("RawCharacter parser EOF", () => {
	const source = new StringSource("");
	const ptr = new SourcePointer(source);

	expect(RawCharacter.parse(ptr).isJust()).toBeFalsy();
});

test("matches combinator", () => {
	expect(RawCharacter.matches(x => x === "e").parse(ptr).isJust()).toBeFalsy();

	const [value, rest] = RawCharacter.matches(x => x === "h").parse(ptr).from();
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

test("orMany combinator", () => {
	const a = Fail;
	const b = Fail;
	const c = Return(5);
	const d = Return(13);
	d.parse = jest.fn();

	let [value, rest] = Parser.orMany([a, b, c, d]).parse(ptr).from();
	expect(value).toStrictEqual(5);
	expect(d.parse).not.toHaveBeenCalled();

	expect(Parser.orMany([a, b]).parse(ptr).isJust()).toBeFalsy();
});

test("repeat combinator", () => {
	let [value, rest] = RawCharacter.repeat(3).parse(ptr).from();
	expect(value).toStrictEqual(["h", "e", "l"]);
	expect(rest.equals("lo")).toBeTruthy();

	[value, rest] = RawCharacter.matches(x => x === "h" || x === "e").repeat().parse(ptr).from();
	expect(value).toStrictEqual(["h", "e"]);
	expect(rest.equals("llo")).toBeTruthy();
});

test("map combinator", () => {
	let [value, rest] = Return(123).map(x => x * 2).parse(ptr).from();
	expect(value).toStrictEqual(246);
});

test("first combinator", () => {
	let [value, rest] = RawCharacter.first(RawCharacter).parse(ptr).from();
	expect(value).toStrictEqual("h");
	expect(rest.equals("llo")).toBeTruthy();
});

test("second combinator", () => {
	let [value, rest] = RawCharacter.second(RawCharacter).parse(ptr).from();
	expect(value).toStrictEqual("e");
	expect(rest.equals("llo")).toBeTruthy();
});

test("then combinator", () => {
	let [value, rest] = RawCharacter.then(RawCharacter).parse(ptr).from();
	expect(value).toStrictEqual(["h", "e"]);
	expect(rest.equals("llo")).toBeTruthy();
});

test("bind combinator", () => {
	let [value, rest] = Return(4).bind(n => RawCharacter.repeat(n)).parse(ptr).from();
	expect(value).toStrictEqual(["h", "e", "l", "l"]);
	expect(rest.equals("o")).toBeTruthy();
});

test("lazy evaluation helper", () => {
	const magic = () => RawCharacter;
	let [value, rest] = Return(4).bind(n => Parser.lazy(magic).repeat(n)).parse(ptr).from();
	expect(value).toStrictEqual(["h", "e", "l", "l"]);
	expect(rest.equals("o")).toBeTruthy();
});
