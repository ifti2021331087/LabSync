"use client";

import { FormEvent, useState } from "react"
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
import { auth } from "@/lib/auth";
import { authClient, signIn } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z
    .string().email("Enter a valid email address."),
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

    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
      callbackURL: "/",
      rememberMe: false
    }, {
      onRequest: (ctx) => {
        setIsLoading(true);
      },
      onSuccess: (ctx) => {
        setIsLoading(false);
        router.push("/");
      },
      onError: (ctx) => {
        setIsLoading(false);
        // console.log(ctx.error.message)
        toast.error(ctx.error.message || "Please sign up to at first");
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
        // disableRedirect: true,
      })
    }
    catch (e) {
      console.log("Sign in failed ",e);
      toast.error("Failed to signIn with google");
    }
    finally {
      setIsLoading(false);
    }
  }


  return (
    <Card className="w-full max-w-sm ">
      <CardHeader>
        <CardTitle>Sign in to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Button variant="link" className={"cursor-pointer"}>
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
              <Input id="password"
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
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" form="form-rhf-demo" className="w-full cursor-pointer">
          Sign in
        </Button>
        <Button variant="outline" className="w-full cursor-pointer" onClick={handleGoogleSignIn}>
          Sign in with Google
        </Button>
      </CardFooter>
    </Card>
  )
}