export const Gamemodes = {
	WARZONE: "Warzone",
	MULTIPLAYER: "Multiplayer",
	RANKED_MULTIPLAYER: "Ranked Multiplayer",
	RESURGENCE: "Resurgence",
	DMZ: "DMZ"
} as const;

export type GamemodeLabel = typeof Gamemodes[keyof typeof Gamemodes];
export type GamemodeValue = keyof typeof Gamemodes;

type GamemodeOption = {
	label: GamemodeLabel;
	value: GamemodeValue;
}

export const gamemodeOptions: GamemodeOption[] = [
	{
		label: "Warzone",
		value: "WARZONE"
	},
	{
		label: "Multiplayer",
		value: "MULTIPLAYER"
	},
	{
		label: "Ranked Multiplayer",
		value: "RANKED_MULTIPLAYER"
	},
	{
		label: "Resurgence",
		value: "RESURGENCE"
	},
	{
		label: "DMZ",
		value: "DMZ"
	},
]