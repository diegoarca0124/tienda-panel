export const prefixMask = {
	mask: /^[A-Z]{0,3}$/,
	prepare: (str: string) => str.toUpperCase(),
};
