import NextAuth from "next-auth/next"
import { authOptions } from "@/lib/auth"

console.log("NextAuth API route hit:", new Date().toISOString());

const handler = NextAuth(authOptions)

console.log("NextAuth handler created");

export { handler as GET, handler as POST }
