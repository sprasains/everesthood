// /middleware.ts
// NextAuth.js middleware for route protection
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*"], // Protect dashboard and subroutes
};
