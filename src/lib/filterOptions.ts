import type { SortOption } from "../types/Filters";

export const sortOptions: SortOption[] = [
	{
		name: "Hot",
		value: "hot",
	},
	{
		name: "New",
		value: "new",
	},
	{
		name: "Top",
		value: "top",
	},
	{
		name: "Worst",
		value: "worst",
	},
];

export const dateRangeOptions = [
	{
		name: "This Week",
		value: "this_week",
	},
	{
		name: "This Month",
		value: "this_month",
	},
	{
		name: "This Year",
		value: "this_year",
	},
	{
		name: "All Time",
		value: "all_time",
	},
]