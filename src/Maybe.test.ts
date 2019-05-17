import { Maybe } from "./Maybe";

const just: Maybe<number> = Maybe.just(123);
const nothing: Maybe<number> = Maybe.nothing();

test("isJust", () => {
	expect(just.isJust()).toBeTruthy();
	expect(nothing.isJust()).toBeFalsy();
});

test("from", () => {
	expect(just.from()).toStrictEqual(123);
	expect(() => nothing.from()).toThrow("Nothing");
});

test("or", () => {
	expect(just.or(nothing).from()).toStrictEqual(123);
	expect(nothing.or(just).from()).toStrictEqual(123);

	const a = Maybe.just(1);
	const b = Maybe.just(2);
	expect(a.or(b).from()).toStrictEqual(1);
});

test("map", () => {
	expect(just.map(x => 2*x).or(Maybe.just(0)).from()).toStrictEqual(246);
	expect(nothing.map(x => 2*x).or(Maybe.just(0)).from()).toStrictEqual(0);
});
