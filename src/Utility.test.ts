import { cons } from "./Utility";

test("cons", () => {
	expect(cons([1, [2, 3]])).toStrictEqual([1, 2, 3]);
})