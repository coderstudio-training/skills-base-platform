// lib/auth.ts

import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { jwtDecode } from "jwt-decode"
import { logger } from '@/lib/utils'

interface DecodedToken {
  email: string
  sub: string
  roles: string[]
  iat: number
  exp: number
}

console.log("Starting to load auth options in lib/auth.ts...")

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        access_token: { label: "Access Token", type: "text" }
      },
      async authorize(credentials): Promise<any> {
        console.log('Authorize function called with credentials: ' + JSON.stringify(credentials, null, 2))

        logger.log('Starting authorize function')
        if (!credentials?.access_token) {
          logger.error('No access token provided')
          return null
        }

        try {
          logger.log('Decoding token')
          const decodedToken = jwtDecode<DecodedToken>(credentials.access_token)
          logger.log('Decoded token:', JSON.stringify(decodedToken))

          // Validate the decoded token
          if (!decodedToken.email || !decodedToken.sub || !Array.isArray(decodedToken.roles)) {
            logger.error('Invalid token structure')
            return null
          }

          // Check token expiration
          const currentTime = Math.floor(Date.now() / 1000)
          if (decodedToken.exp && decodedToken.exp < currentTime) {
            logger.error('Token has expired')
            return null
          }

          const role = decodedToken.roles.includes('admin')
            ? 'admin'
            : (decodedToken.roles.includes('manager') ? 'manager' : 'employee')

          return {
            id: decodedToken.sub,
            name: decodedToken.email.split('@')[0], // You might want to adjust this
            email: decodedToken.email,
            accessToken: credentials.access_token,
            role: role
          }
        } catch (error) {
          logger.error("Token decode error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      logger.log('JWT Callback - Token:', JSON.stringify(token))
      logger.log('JWT Callback - User:', user ? JSON.stringify(user) : 'No user')
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.accessToken = user.accessToken
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      logger.log('Session Callback - Token:', JSON.stringify(token))
      session.user = {
        id: token.id as string,
        name: token.name as string,
        email: token.email as string,
        accessToken: token.accessToken as string,
        role: token.role as 'employee' | 'manager' | 'admin'
      }
      logger.log('Session Callback - Session:', JSON.stringify(session))
      return session
    }
  },
  pages: {
    signIn: '/admin-login',
    //error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
}


// // lib/auth.ts
// import { NextAuthOptions } from "next-auth"
// import CredentialsProvider from "next-auth/providers/credentials"

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" }
//       },
//       async authorize(credentials) {
//         console.log("Authorize function called with credentials:", credentials)

//         if (!credentials?.email || !credentials?.password) {
//           console.log("Missing email or password")
//           return null
//         }

//         try {
//           console.log("Attempting to authenticate with User Service")
//           const res = await fetch("http://localhost:3001/auth/login", {
//             method: "POST",
//             body: JSON.stringify(credentials),
//             headers: { "Content-Type": "application/json" }
//           })

//           console.log("User Service response status:", res.status)

//           const userData = await res.json()
//           console.log("User Service response body:", userData)

//           if (res.ok && userData) {
//             console.log("Authentication successful")
//             return {
//               id: userData.id,
//               name: userData.name,
//               email: userData.email,
//               accessToken: userData.accessToken,
//               role: userData.role as 'employee' | 'manager' | 'admin'
//             }
//           }

//           console.log("Authentication failed")
//           return null
//         } catch (error) {
//           console.error("Authentication error:", error)
//           return null
//         }
//       }
//     })
//   ],
//   callbacks: {
//     async signIn({ user, account, profile, email, credentials }) {
//       console.log("SignIn callback:", { user, account, profile, email, credentials });
//       return true;
//     },
//     async jwt({ token, user }) {
//       console.log("JWT Callback - Token:", token, "User:", user)
//       if (user) {
//         token.id = user.id
//         token.name = user.name
//         token.email = user.email
//         token.accessToken = user.accessToken
//         token.role = user.role
//       }
//       return token
//     },
//     async session({ session, token }) {
//       console.log("Session Callback - Session:", session, "Token:", token)
//       session.user = {
//         id: token.id,
//         name: token.name,
//         email: token.email,
//         accessToken: token.accessToken,
//         role: token.role
//       }
//       return session
//     }
//   },
//   events: {
//     async signIn(message) { console.log("Signed in", message) },
//     async signOut(message) { console.log("Signed out", message) },
//     //async error(message) { console.log("Error", message) },
//   },
//   pages: {
//     signIn: '/admin-login',
//   },
//   debug: true,
// }
