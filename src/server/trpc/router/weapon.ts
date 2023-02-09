import { router, publicProcedure, protectedProcedure } from "../trpc";
import { WeaponCategory } from "@prisma/client";
import weapons from "../../../lib/weapons";
import type { WeaponsByCategory } from "../../../types/Weapons";

export const weaponRouter = router({
	getAll: publicProcedure.query(async ({ ctx }) => {
		try {
			return await ctx.prisma.weapon.findMany()
		}
		catch (error) {
			console.warn('Error in weapon.getAll: ');
			console.log(error);
		}
	}),
	getAllByCategory: publicProcedure.query(async ({ ctx }) => {
		try {
			const weapon = await ctx.prisma.weapon.findMany()
			const weaponsByCategory = weapon.reduce((acc: WeaponsByCategory, cur) => {
				if (acc[cur.category]) {
					acc[cur.category].push(cur)
				}
				else {
					acc[cur.category] = [cur]
				}
				return acc
			}, {
				[WeaponCategory.ASSAULT]: [],
				[WeaponCategory.BATTLE]: [],
				[WeaponCategory.HANDGUN]: [],
				[WeaponCategory.LAUNCHER]: [],
				[WeaponCategory.LMG]: [],
				[WeaponCategory.MARKSMAN]: [],
				[WeaponCategory.MELEE]: [],
				[WeaponCategory.SHOTGUN]: [],
				[WeaponCategory.SMG]: [],
				[WeaponCategory.SNIPER]: [],
			})

			return weaponsByCategory
		}
		catch (error) {
			console.warn('Error in weapon.getAllByCategory: ');
			console.log(error);
		}
	}),
	setDefault: protectedProcedure
		.mutation(async ({ ctx }) => {
			console.log('adding weapons')

			for (const [category, items] of Object.entries(weapons)) {
				await ctx.prisma.weapon.createMany({
					data: items.map((item) => ({
						name: item.name,
						category: category as WeaponCategory,
					}))
				})
			}
		}),
})