import { StringSource, SourcePointer } from "../Source";
import { expr } from "./Expr";

import * as readline from "readline";
import { Spaces } from "../Parser";

function calculate(expression: string): number {
	const source = new StringSource(expression);
	const ptr = new SourcePointer(source);
	const result = Spaces.second(expr).parse(ptr);

	if (!result.isJust()) {
		throw "syntax error";
	}

	const [ast, rest] = result.from();
	if (rest.length() !== 0) {
		throw "trailing garbage";
	}

	return ast.evaluate();
}

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const prompt = () => rl.question("> ", e => {
	try {
		console.log(" = " + calculate(e));
	} catch (err) {
		console.log("error: " + err);
	}
	prompt();
});

prompt();
