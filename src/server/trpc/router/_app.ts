import { attachmentRouter } from './attachment';
import { buildRouter } from './build';
import { router } from "../trpc";
import { authRouter } from "./auth";
import { weaponRouter } from './weapon';

export const appRouter = router({
	build: buildRouter,
	auth: authRouter,
	weapon: weaponRouter,
	attachment: attachmentRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
