export const Tags = {
	LONG_RANGE: "Long Range",
	MID_RANGE: "Mid Range",
	SHORT_RANGE: "Short Range",
	SNIPER_SUPPORT: "Sniper Support",
	FAST_ADS: "Fast ADS",
	FAST_MOVEMENT: "Fast Movement",
	FAST_TTK: "Fast TTK",
	FAST_RELOAD: "Fast Reload",
	FAST_SWITCH: "Fast Switch",
	FAST_FIRERATE: "Fast Fire Rate",
	LOW_RECOIL: "Low Recoil",
	SMALL_ZOOM: "Small Zoom",
	MEDIUM_ZOOM: "Medium Zoom",
	HIGH_ZOOM: "High Zoom"
} as const;

export type TagLabel = typeof Tags[keyof typeof Tags];
export type TagValue = keyof typeof Tags;

type TagOption = {
	label: TagLabel;
	value: TagValue;
}

export const buildTagOptions: TagOption[] = [
	{
		label: "Long Range",
		value: "LONG_RANGE"
	},
	{
		label: "Mid Range",
		value: "MID_RANGE"
	},
	{
		label: "Short Range",
		value: "SHORT_RANGE"
	},
	{
		label: "Sniper Support",
		value: "SNIPER_SUPPORT"
	},
	{
		label: "Fast ADS",
		value: "FAST_ADS"
	},
	{
		label: "Fast Movement",
		value: "FAST_MOVEMENT"
	},
	{
		label: "Fast TTK",
		value: "FAST_TTK"
	},
	{
		label: "Fast Reload",
		value: "FAST_RELOAD"
	},
	{
		label: "Fast Switch",
		value: "FAST_SWITCH"
	},
	{
		label: "Fast Fire Rate",
		value: "FAST_FIRERATE"
	},
	{
		label: "Low Recoil",
		value: "LOW_RECOIL"
	},
	{
		label: "Small Zoom",
		value: "SMALL_ZOOM"
	},
	{
		label: "Medium Zoom",
		value: "MEDIUM_ZOOM"
	},
	{
		label: "High Zoom",
		value: "HIGH_ZOOM"
	}
]