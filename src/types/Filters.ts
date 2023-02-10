export enum DateRange {
	ThisWeek = "this_week",
	ThisMonth = "this_month",
	ThisYear = "this_year",
	AllTime = "all_time",
}

export enum Sort {
	Hot = "hot",
	New = "new",
	Top = "top",
	Worst = "worst",
}

export type SortOption = {
	name: keyof typeof Sort;
	value: "hot" | "new" | "top" | "worst";
};