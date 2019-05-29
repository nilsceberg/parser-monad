export function cons<T>([x, xs]: [T, T[]]): T[] {
	return [x].concat(xs);
}

export function add([a, b]: [any, any]): any {
	return a + b;
}
