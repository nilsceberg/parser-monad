import { StringSource, SourcePointer } from "./Source";
import { Lit, Alphanumeric, Word } from "./Parser";

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
	expect(rest.equals(" my friend"))
});
