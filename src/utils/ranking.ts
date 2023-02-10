const hot = (ups: number, downs: number, date: Date) => {
	const score = ups - downs;
	const order = Math.log(Math.max(Math.abs(score), 1)) / Math.LN10;
	const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
	const seconds = (date.getTime() / 1000) - 1134028003;
	const product = order + sign * seconds / 45000;
	return Math.round(product * 10000000) / 10000000;
}

export default hot;