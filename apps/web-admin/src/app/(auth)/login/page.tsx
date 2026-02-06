import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, signup } from "./actions";

export default function LoginPage(props: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto min-h-screen">
      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-4 text-foreground">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Survey Inventory System
        </h1>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="••••••••"
            required
          />
        </div>

        <Button formAction={login} className="w-full">
          Sign In
        </Button>
        <Button formAction={signup} variant="outline" className="w-full">
          Sign Up
        </Button>
      </form>
    </div>
  );
}
