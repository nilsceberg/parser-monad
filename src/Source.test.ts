import { StringSource, SourcePointer } from "./Source";

test("first and rest", () => {
	const source = new StringSource("hello");
	const ptr = new SourcePointer(source);

	expect(ptr.first()).toStrictEqual("h");
	expect(ptr.rest().equals("ello")).toBeTruthy();
});
