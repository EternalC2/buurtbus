
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInWithEmailAndPassword, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Bus, Loader2, Shield } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Voer een geldig e-mailadres in." }),
  password: z.string().min(1, { message: "Wachtwoord is vereist." }),
});

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function checkAdminRole(user: User): Promise<boolean> {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists() && userDoc.data().role === 'admin') {
      return true;
    }
    return false;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const isAdmin = await checkAdminRole(userCredential.user);

      if (isAdmin) {
        toast({
          title: "Succesvol ingelogd als admin!",
          description: "U wordt nu doorgestuurd.",
        });
        router.push("/admin/dashboard");
      } else {
        await auth.signOut();
        toast({
          variant: "destructive",
          title: "Inloggen mislukt",
          description: "U heeft geen beheerdersrechten.",
        });
      }
    } catch (error: any) {
      console.error("Error signing in:", error);
      let errorMessage = "Er is een onbekende fout opgetreden.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "Ongeldige inloggegevens. Controleer uw e-mail en wachtwoord.";
      }
      toast({
        variant: "destructive",
        title: "Inloggen mislukt",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-full flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="bg-primary rounded-full p-4 mb-4">
          <Shield className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 font-headline">
          Beheerderspaneel
        </h1>
        <p className="text-muted-foreground mt-2">
          Log in om door te gaan.
        </p>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Voer uw beheerdersgegevens in.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mailadres</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@voorbeeld.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wachtwoord</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Inloggen als Admin
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </main>
  );
}
