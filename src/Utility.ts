export function cons<T>([x, xs]: [T, T[]]): T[] {
	return [x].concat(xs);
}
