import { RawCharacter, Fail, Parser, Error, Return } from "./Core";
import { char } from "./Source";
import { cons } from "./Utility";

export class ParserSettings {
	static WHITESPACE: (Parser<string> | string)[] = [" ", "\t", "\n", "\r"];
	static LINE_COMMENT = [];
	static LINE_COMMENT_END = ["\n"];
	static CASE_SENSITIVE = true;
}

// Base
export const RawLit = (c: char) => RawCharacter.matches(x => x === c);
export const RawSequence = (n: number) => RawCharacter.repeat(n).map(x => x.join(""));
export const RawLitSequence: (sequence: string) => Parser<string> =
	sequence => RawSequence(sequence.length).matches(x => x === sequence);

export const CharThatIsNotTheStartOf: (sequences: string[]) => Parser<char> = sequences =>
	Parser.orMany(sequences.map(s => RawLitSequence(s)))
	.or(RawCharacter)
	.matches(c => !sequences.includes(c));

export const LineComment =
	Parser.lazy(() =>
		Parser.orMany(ParserSettings.LINE_COMMENT.map(
			c => RawLitSequence(c)
		))
		.second(CharThatIsNotTheStartOf(ParserSettings.LINE_COMMENT_END).repeat())
	).map(s => s.join(""));

export const Character = LineComment.repeat().second(RawCharacter);

// Utility
export const Lit = (c: char) => Character.matches(x => x === c);

// Trivial
export const Space = Parser.lazy(() => Parser.orMany(ParserSettings.WHITESPACE.map(
	w => (w instanceof Parser) ? w : RawLitSequence(w)
)));
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

export const Accept: (token: string, cs?: boolean) => Parser<string> =
	(token, cs = ParserSettings.CASE_SENSITIVE) => Token(Sequence(token.length))
	.matches(x => x.localeCompare(token, undefined, { sensitivity: cs ? "variant" : "accent" }) === 0);

export const Require: (token: string, cs?: boolean) => Parser<string> =
	(token, cs = ParserSettings.CASE_SENSITIVE) => Accept(token).or(Error(`expected '${token}'`));

export const Allow: (token: string, cs?: boolean) => Parser<string> =
	(token, cs = ParserSettings.CASE_SENSITIVE) => Accept(token).or(Return(""));

export const Default: <T>(parser: Parser<T>, def: T) => Parser<T> =
	(p, d) => p.or(Return(d));
