import { Parser, Character, Lit } from "./Core";
import { StringSource, SourcePointer, char } from "./Source";

test("matches combinator", () => {
	const source = new StringSource("hello");
	const ptr = new SourcePointer(source);

	expect(Character.matches(x => x === "e").parse(ptr).isJust()).toBeFalsy();

	const [result, rest] = Character.matches(x => x === "h").parse(ptr).from();
	expect(result).toStrictEqual("h");
	expect(rest.equals("ello")).toBeTruthy();
});

test("character parser", () => {
	const source = new StringSource("hello");
	const ptr = new SourcePointer(source);

	const [result, rest] = Character.parse(ptr).from();

	expect(result).toStrictEqual("h");
	expect(rest.equals("ello")).toBeTruthy();
});

test("lit parser", () => {
	const source = new StringSource("hello");
	const ptr = new SourcePointer(source);

	expect(Lit("e").parse(ptr).isJust()).toBeFalsy();

	const [result, rest] = Character.matches(x => x === "h").parse(ptr).from();
	expect(result).toStrictEqual("h");
	expect(rest.equals("ello")).toBeTruthy();
});
