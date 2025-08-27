import { sigalitRouter } from "~/server/api/routers/sigalit";
import { schedulingRouter } from "~/server/api/routers/scheduling";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  sigalit: sigalitRouter,
  scheduling: schedulingRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.sigalit.getUsers();
 *       ^? User[]
 */
export const createCaller = createCallerFactory(appRouter);
