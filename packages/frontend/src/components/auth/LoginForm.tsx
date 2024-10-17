// 'use client'

// import { useState, FormEvent } from 'react'
// import { signIn } from 'next-auth/react'
// import { useRouter } from 'next/navigation'
// import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { Loader2 } from 'lucide-react'
// import { logger } from '@/lib/utils'

// export default function LoginForm() {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const router = useRouter()

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault()
//     setIsLoading(true)
//     setError(null)

// //     try {
// //       const result = await authenticateUser(email, password)
// //       if (result.success) {
// //         router.push('/dashboard/admin')
// //       } else {
// //         setError(result.error || 'An unexpected error occurred')
// //       }
// //     } catch (err) {
// //       console.error('Login Error:', err)
// //       setError('An unexpected error occurred. Please try again.')
// //     } finally {
// //       setIsLoading(false)
// //     }
// //   }
//     try {
//       const result = await signIn('credentials', {
//         redirect: false,
//         email,
//         password,
//       })

//       if (result?.error) {
//         setError(result.error)
//       } else {
//         router.push('/dashboard/admin')
//       }
//     } catch (err) {
//       setError('An unexpected error occurred. Please try again.')
//     } finally {
//       setIsLoading(false)
//     }
//   }


//   return (
//     <Card className="w-[350px]">
//       <CardHeader>
//         <h2 className="text-2xl font-bold text-center">Login</h2>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit}>
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="Enter your email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </div>
//           </div>
//           <Button
//             type="submit"
//             className="w-full mt-4"
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Logging in...
//               </>
//             ) : (
//               'Log in'
//             )}
//           </Button>
//         </form>
//       </CardContent>
//       {error && (
//         <CardFooter>
//           <Alert variant="destructive">
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
//         </CardFooter>
//       )}
//     </Card>
//   )
// }

// async function authenticateUser(email: string, password: string): Promise<{ success: boolean; error?: string }> {
//  console.log('Starting signIn process')
//   try {
//     const userServiceUrl = process.env.NEXT_PUBLIC_USER_SERVICE_URL
//     logger.log(`Authenticating with User Service: ${userServiceUrl}/auth/login`)
//     const apiResponse = await fetch(`${userServiceUrl}/auth/login`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email, password }),
//     })

//     const data = await apiResponse.json()
//     console.log('User Service Response:', { status: apiResponse.status, data: JSON.stringify(data) })

//     if (!apiResponse.ok) {
//       logger.error('User Service authentication failed')
//       return { success: false, error: data.message || 'Authentication failed' }
//     }

//     if (!data.access_token) {
//       logger.error('No access token in response')
//       return { success: false, error: 'Invalid response from authentication service' }
//     }

//     logger.log('User Service authentication successful, calling NextAuth signIn')
//     const result = await signIn('credentials', {
//       redirect: false,
//       email,
//       password,
//       accessToken: data.access_token,
//       callbackUrl: '/dashboard/admin'
//     })

//     logger.log('NextAuth signIn result:', result)

//     if (result?.error) {
//       logger.error('NextAuth signIn failed:', result.error)
//       return { success: false, error: result.error }
//     }

//     if (result?.ok) {
//       logger.log('NextAuth signIn successful')
//       return { success: true }
//     }

//     logger.error('Unexpected result from NextAuth signIn')
//     return { success: false, error: 'An unexpected error occurred' }
//   } catch (error) {
//     logger.error('SignIn Error:', error)
//     return { success: false, error: 'An unexpected error occurred. Please try again.' }
//   }
// }
'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { logger } from "@/lib/utils"

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    console.log("Attempting to sign in with:", { email, password: '******' })

    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("API response:", data);

      if (response.ok) {
        // Manually set the session
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
          access_token: data.access_token,
          callbackUrl: '/dashboard/admin'
        });
        console.log("SignIn result:", result);

        if (result?.error) {
          setError(result.error);
        } else if (result?.ok) {
          router.push('/dashboard/admin');
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("SignIn error:", err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Log in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
