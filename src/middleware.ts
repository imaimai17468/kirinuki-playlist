import { AUTH_REQUIRED_PATHS_ARRAY, CLIENT_PATH } from "@/consts/clientpath";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(AUTH_REQUIRED_PATHS_ARRAY);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req))
    await auth.protect({
      unauthenticatedUrl: new URL(CLIENT_PATH.LOGIN_REQUIRED, req.url).toString(),
      unauthorizedUrl: new URL(CLIENT_PATH.LOGIN_REQUIRED, req.url).toString(),
    });
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
