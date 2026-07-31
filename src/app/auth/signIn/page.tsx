"use client";

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod"
import { authClient, signIn } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .max(20, "Password must be at most 20 characters."),
})
type SignInFormValues = z.infer<typeof formSchema>;

export default function SignIn() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(data: SignInFormValues) {
    await authClient.signIn.email({
      email: data.email,
      password: data.password,
      callbackURL: "/",
      rememberMe: false
    }, {
      onRequest: () => {
        setIsLoading(true);
      },
      onSuccess: () => {
        setIsLoading(false);
        router.push("/");
      },
      onError: (ctx) => {
        setIsLoading(false);
        toast.error(ctx.error.message || "Please sign up first");
      },
    })
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/",
        errorCallbackURL: "/error",
        newUserCallbackURL: "/",
      })
    } catch (e) {
      console.log("Sign in failed ", e);
      toast.error("Failed to sign in with Google");
    } finally {
      setIsLoading(false);
    }
  }

  // Helper to autofill and submit demo accounts
  const fillDemoAccount = (email: string) => {
    form.setValue("email", email);
    form.setValue("password", "12345678"); // Change to your actual test account password
    form.handleSubmit(onSubmit)();
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign in to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Button variant="link" className="cursor-pointer">
            <Link href={"/auth/signUp"}>Sign Up</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>
          </div>
        </form>

        {/* --- DEMO ACCOUNTS SECTION --- */}
        <div className="mt-6 flex flex-col gap-2 border-t pt-4 border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-center text-muted-foreground font-medium">
            Quick Test Accounts
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="secondary"
              className="w-full text-xs cursor-pointer border border-amber-500/30 hover:bg-amber-500/10"
              onClick={() => fillDemoAccount("admin@test.com")}
              disabled={isLoading}
            >
              Test Admin
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full text-xs cursor-pointer border border-blue-500/30 hover:bg-blue-500/10"
              onClick={() => fillDemoAccount("user@test.com")}
              disabled={isLoading}
            >
              Test User
            </Button>
          </div>
        </div>
        {/* ----------------------------- */}
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          type="submit"
          form="form-rhf-demo"
          className="w-full cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
        <Button
          variant="outline"
          className="w-full cursor-pointer"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          Sign in with Google
        </Button>
      </CardFooter>
    </Card>
  )
}