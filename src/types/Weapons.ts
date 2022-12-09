import type { Weapon, WeaponCategory } from "@prisma/client";

export type WeaponsByCategory = {
	[key in WeaponCategory]: Weapon[]
}