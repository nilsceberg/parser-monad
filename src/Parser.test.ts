import { StringSource, SourcePointer } from "./Source";
import { Lit, Alphanumeric, Word, Token, Integer, Digit, Accept, Require, Allow, Default, ParserSettings, LineComment, RawLitSequence, Sequence, Spaces } from "./Parser";

beforeEach(() => {
	ParserSettings.LINE_COMMENT = ["//"];
});

test("space parser", () => {
	const oldWhitespace = ParserSettings.WHITESPACE;
	ParserSettings.WHITESPACE = ["aa", "b"];

	const source = new StringSource("aabac");
	const ptr = new SourcePointer(source);

	const [result, rest] = Spaces.parse(ptr).from();

	expect(result).toStrictEqual(["aa", "b"]);
	expect(rest.equals("ac")).toBeTruthy();

	ParserSettings.WHITESPACE = oldWhitespace;
});

test("raw lit sequence", () => {
	const source = new StringSource("// test comment");
	const ptr = new SourcePointer(source);

	const [result, rest] = RawLitSequence("//").parse(ptr).from();

	expect(result).toStrictEqual("//");
	expect(rest.equals(" test comment")).toBeTruthy();
});

test("line comment parser", () => {
	const source = new StringSource("// test comment\nrest");
	const ptr = new SourcePointer(source);

	const [result, rest] = LineComment.parse(ptr).from();
	expect(result).toStrictEqual(" test comment");
	expect(rest.equals("\nrest")).toBeTruthy();
});

describe("character parser", () => {
	test("single comment", () => {
		const source = new StringSource("ab// test comment\ncd");
		const ptr = new SourcePointer(source);

		const [result, rest] = Sequence(5).parse(ptr).from();
		expect(result).toStrictEqual("ab\ncd");
		expect(rest.equals("")).toBeTruthy();
	});

	test("multiple comments", () => {
		const source = new StringSource("ab// test comment\n// again\ncd");
		const ptr = new SourcePointer(source);

		const [result, rest] = Sequence(6).parse(ptr).from();
		expect(result).toStrictEqual("ab\n\ncd");
		expect(rest.equals("")).toBeTruthy();
	});
});

test("lit parser", () => {
	const source = new StringSource("hello");
	const ptr = new SourcePointer(source);

	expect(Lit("e").parse(ptr).isJust()).toBeFalsy();

	const [result, rest] = Lit("h").parse(ptr).from();
	expect(result).toStrictEqual("h");
	expect(rest.equals("ello")).toBeTruthy();
});

test("alphanumeric parser", () => {
	const s1 = new StringSource("hello");
	const p1 = new SourcePointer(s1);

	const s2 = new StringSource("3ello");
	const p2 = new SourcePointer(s2);

	const s3 = new StringSource("?ello");
	const p3 = new SourcePointer(s3);

	let [result] = Alphanumeric.parse(p1).from();
	expect(result).toStrictEqual("h");

	[result] = Alphanumeric.parse(p2).from();
	expect(result).toStrictEqual("3");

	expect(Alphanumeric.parse(p3).isJust()).toBeFalsy();
});

test("word parser", () => {
	const s = new StringSource("hello my friend");
	const p = new SourcePointer(s);

	let [result, rest] = Word.parse(p).from();
	expect(result).toStrictEqual("hello");
	expect(rest.equals(" my friend")).toBeTruthy();
});

test("token parser", () => {
	const s = new StringSource("h3ll0  \n\t my dear");
	const p = new SourcePointer(s);

	let [result, rest] = Token(Word).parse(p).from();
	expect(result).toStrictEqual("h3ll0");
	expect(rest.equals("my dear")).toBeTruthy();
});

test("integer parser", () => {
	const s = new StringSource("1337  h3ll0  \n\t my dear");
	const p = new SourcePointer(s);

	const [result, rest] = Token(Integer).parse(p).from();
	expect(result).toStrictEqual(1337);

	expect(Token(Integer).parse(rest).isJust()).toBeFalsy();
});

test("accept parser", () => {
	const source = new StringSource("while_ something; do; done");
	const ptr = new SourcePointer(source);

	const [_, rest] = Accept("while_").parse(ptr).from();
	expect(rest.equals("something; do; done")).toBeTruthy();

	expect(Accept("if").parse(ptr).isJust()).toBeFalsy();
});

test("require parser", () => {
	const source = new StringSource("while_ something; do; done");
	const ptr = new SourcePointer(source);

	const [_, rest] = Require("while_").parse(ptr).from();
	expect(rest.equals("something; do; done")).toBeTruthy();

	expect(() => Require("if").parse(ptr))
		.toThrow("expected 'if' at ?");
});

test("allow parser", () => {
	const source = new StringSource("while_ something; do; done");
	const ptr = new SourcePointer(source);

	let [_, rest] = Allow("while_").parse(ptr).from();
	expect(rest.equals("something; do; done")).toBeTruthy();

	[_, rest] = Allow("if_").parse(ptr).from();
	expect(rest.equals("while_ something; do; done")).toBeTruthy();
});

test("default parser", () => {
	const source = new StringSource("first second");
	const ptr = new SourcePointer(source);

	let [result, rest] = Default(Accept("first"), "default").parse(ptr).from();
	expect(result).toStrictEqual("first");
	expect(rest.equals("second")).toBeTruthy();

	[result, rest] = Default(Accept("third"), "default").parse(ptr).from();
	expect(result).toStrictEqual("default");
	expect(rest.equals("first second")).toBeTruthy();
});
