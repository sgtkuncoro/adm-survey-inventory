"use client"

import { useState } from "react"
import { login } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"

export function LoginForm() {
  const searchParams = useSearchParams()
  const message = searchParams.get("message")
  const error = searchParams.get("error")
  
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Show toast if message or error exists in URL
  if (message) {
    // Ideally this should be in a useEffect but toast might dedup
    // For now we rely on the user seeing the login screen with message or params
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            {message ? (
              <span className="text-green-600 font-medium">{message}</span>
            ) : error ? (
               <span className="text-red-500 font-medium">{error}</span>
            ) : (
              "Sign in with your email"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full">
              Send Login Link
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
