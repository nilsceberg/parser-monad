import { Character, Fail, Parser, Error, Return } from "./Core";
import { char } from "./Source";
import { cons } from "./Utility";

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

// Derived
export const Word = Alphanumeric.repeat().map(x => x.join(""));
export const Spaces = Space.repeat();
export const Token = <T>(p: Parser<T>) => p.first(Spaces);
export const Integer = Digit.then(Digit.repeat()).map(x => Number.parseInt(cons(x).join("")));
export const Sequence = (n: number) => Character.repeat(n).map(x => x.join(""));

export const Accept: (token: string) => Parser<string> = token => Token(Sequence(token.length)).matches(x => x === token);
export const Require: (token: string) => Parser<string> = token => Accept(token).or(Error(`expected '${token}'`));
export const Allow: (token: string) => Parser<string> = token => Accept(token).or(Return(""));
