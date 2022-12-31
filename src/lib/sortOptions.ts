import type { SortOption } from "../types/Filters";

const sortOptions: SortOption[] = [
	{
		name: "Newest",
		value: "newest",
	},
	{
		name: "Oldest",
		value: "oldest",
	},
	{
		name: "Rating (Low to High)",
		value: "rating-asc",
	},
	{
		name: "Rating (High to Low)",
		value: "rating-desc",
	},
];

export default sortOptions;