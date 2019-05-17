import { Character } from "./Core";
import { char } from "./Source";

// Derived
export const Lit = (c: char) => Character.matches(x => x === c);

// Trivial
export const Space = Character.matches(x => " \t\n".includes(x));
export const Digit = Character.matches(x => "0123456789".includes(x));
