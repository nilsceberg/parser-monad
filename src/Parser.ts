import { Character } from "./Core";
import { char } from "./Source";

export const Lit = (c: char) => Character.matches(x => x === c);
