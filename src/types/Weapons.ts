import type { Weapon, WeaponCategory } from "@prisma/client";

export type WeaponsByCategory = Record<WeaponCategory, Weapon[]>