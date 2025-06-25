export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/friends/:path*",
    "/community/:path*",
    "/billing/:path*",
    "/create-post/:path*",
    "/api/v1/:path*",
  ],
};
