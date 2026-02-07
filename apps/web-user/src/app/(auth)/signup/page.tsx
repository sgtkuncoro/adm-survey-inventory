"use client"

import { useState } from "react"
import { signup, checkEmail } from "../login/actions"
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
import { useSearchParams, useRouter } from "next/navigation"

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"email" | "details">("email")
  const [email, setEmail] = useState("")
  
  const queryParams = useSearchParams()
  const router = useRouter()
  
  const message = queryParams.get("message")
  const error = queryParams.get("error")

  async function handleCheckEmail(formData: FormData) {
    setIsLoading(true)
    const emailInput = formData.get("email") as string
    setEmail(emailInput)

    const result = await checkEmail(formData)
    
    setIsLoading(false)
    if (result.exists) {
      // User exists, redirect to login with message
      router.push("/login?message=Account exists! We sent you a login link.")
    } else {
      // User is new, proceed to step 2
      setStep("details")
    }
  }

  return (
    <div className="flex bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden bg-white dark:bg-zinc-950 border-none shadow-none">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold tracking-tight">
                {step === "email" ? "Get Started" : "Create Your Account"}
              </CardTitle>
              <CardDescription className="text-base text-gray-500 mt-2">
                {message ? (
                  <span className="text-green-600 font-medium">{message}</span>
                ) : error ? (
                   <span className="text-red-500 font-medium">{error}</span>
                ) : (
                  step === "email" 
                    ? "Enter your email to join 375,000+ members"
                    : "Complete your profile to start earning"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === "email" ? (
                <form action={handleCheckEmail} className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      autoFocus
                    />
                  </div>
                  <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-6 text-lg mt-4" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Continue
                  </Button>
                </form>
              ) : (<>
                <form action={signup} className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" name="first_name" placeholder="Sarah" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" name="last_name" placeholder="Johnson" required />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    readOnly
                    className="bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="zip">ZIP Code <span className="text-muted-foreground font-normal">(US only)</span></Label>
                  <Input id="zip" name="zip" placeholder="12345" required pattern="[0-9]{5}" title="Five digit zip code" />
                  <p className="text-xs text-muted-foreground">ShopperArmy is currently available to US residents only</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dob">Date of Birth <span className="text-muted-foreground font-normal">(MM/DD/YYYY)</span></Label>
                  <Input id="dob" name="dob" placeholder="MM/DD/YYYY" required />
                  <p className="text-xs text-muted-foreground">ShopperArmy is only available to users 18 years or older</p>
                </div>
                
                <div className="flex items-start space-x-2 mt-2">
                  <div className="flex items-center h-5">
                     <input id="terms" name="terms" type="checkbox" required className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  </div>
                  <div className="text-sm leading-none pt-0.5">
                    <label htmlFor="terms" className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      I agree to the <a href="#" className="underline text-pink-500 hover:text-pink-600">Terms & Conditions</a> and <a href="#" className="underline text-pink-500 hover:text-pink-600">Privacy Policy</a>.
                    </label>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-6 text-lg mt-4" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Account
                </Button>
              </form>
              
              <div className="mt-8 text-center text-sm text-gray-500">
                By creating an account, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>
              </div>

              <div className="mt-6 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-pink-600 underline underline-offset-4 hover:text-pink-500">
                  Sign In
                </Link>
              </div>
              </>
            )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
