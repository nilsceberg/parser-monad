import { Character, Fail } from "./Core";
import { char } from "./Source";

// Utility
export const Lit = (c: char) => Character.matches(x => x === c);

// Trivial
export const Space = Character.matches(x => " \t\n".includes(x));
export const Digit = Character.matches(x => "0123456789".includes(x));
export const Letter = Character.matches(x => {
	const a = x.charCodeAt(0);
	return (a > 0x40 && a < 0x5B) || (a > 0x60 && a < 0x7B);
});
export const Alphanumeric = Letter.or(Digit);

// Utility
export const Word = Alphanumeric.repeat().map(x => x.join(""));
