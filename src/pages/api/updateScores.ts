import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../server/db/client";
import hot from '../../utils/ranking';

// Holding off on this for now. This should run as a cron job every hour, but will just run on every build.getAll request for now.

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method === 'POST') {
		try {
			const { authorization } = req.headers;

			if (authorization === `Bearer ${process.env.RANKING_API_KEY}`) {

				const builds = await prisma.build.findMany()

				for (const build of builds) {
					const { totalLikes, totalDislikes, createdAt } = build;

					const score = hot(totalLikes, totalDislikes, createdAt);

					await prisma.build.update({
						where: {
							id: build.id
						},
						data: {
							// score
						}
					})
				}

				res.status(200).json({ success: true });
			} else {
				res.status(401).json({ success: false });
			}
		} catch (err: any) {
			res.status(500).json({ statusCode: 500, message: err.message });
		}
	} else {
		res.setHeader('Allow', 'POST');
		res.status(405).end('Method Not Allowed');
	}
}