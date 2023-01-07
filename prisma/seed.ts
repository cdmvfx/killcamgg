import { PrismaClient, type WeaponCategory, type AttachmentCategory } from '@prisma/client'
import weapons from "../src/lib/weapons";
import attachments from "../src/lib/attachments";

const prisma = new PrismaClient()

async function main() {

	for (const [category, items] of Object.entries(weapons)) {
		await prisma.weapon.createMany({
			data: items.map((item) => ({
				name: item.name,
				category: category as WeaponCategory,
			}))
		})
	}

	for (const [category, items] of Object.entries(attachments)) {
		await prisma.attachment.createMany({
			data: items.map((item) => ({
				name: item.name,
				category: category as AttachmentCategory,
				unlock_req: item.req
			}))
		})
	}
}
main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})