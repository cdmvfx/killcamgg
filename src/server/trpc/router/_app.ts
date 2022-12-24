import { attachmentRouter } from './attachment';
import { buildRouter } from './build';
import { router } from "../trpc";
import { authRouter } from "./auth";
import { weaponRouter } from './weapon';
import { userRouter } from './user';
import { reviewRouter } from './review';

export const appRouter = router({
	build: buildRouter,
	auth: authRouter,
	weapon: weaponRouter,
	attachment: attachmentRouter,
	user: userRouter,
	review: reviewRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
