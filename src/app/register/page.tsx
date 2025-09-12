"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Loader2, Bus } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  firstName: z.string().min(2, { message: "Voornaam moet minimaal 2 karakters lang zijn." }),
  lastName: z.string().min(2, { message: "Achternaam moet minimaal 2 karakters lang zijn." }),
  age: z.string().optional(),
  email: z.string().email({ message: "Voer een geldig e-mailadres in." }),
  phone: z.string().optional(),
  password: z.string().min(6, { message: "Wachtwoord moet minimaal 6 karakters lang zijn." }),
});

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      age: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      const displayName = `${values.firstName} ${values.lastName}`;
      // 2. Update the user's profile in Firebase Auth (e.g., for displayName)
      await updateProfile(user, { displayName });

      // 3. Create a corresponding user document in Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        firstName: values.firstName,
        lastName: values.lastName,
        age: values.age || "",
        email: values.email,
        phone: values.phone || "",
        createdAt: new Date(),
        role: "user" // Assign a default role
      });

      toast({
        title: "Account aangemaakt!",
        description: "U wordt nu doorgestuurd naar de homepagina.",
      });
      router.push("/home");

    } catch (error: any) {
      console.error("Error creating user:", error);
      let errorMessage = "Er is een onbekende fout opgetreden.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Dit e-mailadres is al in gebruik.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Het wachtwoord is te zwak. Gebruik minimaal 6 karakters."
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Het e-mailadres is ongeldig."
      } else if (error.code === 'firestore/permission-denied') {
        errorMessage = "Kon gebruikersprofiel niet opslaan. Controleer de database-rechten."
      }
      toast({
        variant: "destructive",
        title: "Registratie mislukt",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-full flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="bg-accent rounded-full p-4 mb-4">
          <Bus className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-5xl font-bold text-primary font-headline tracking-tighter">
          Buurtbus
        </h1>
        <p className="text-muted-foreground mt-2">
          gauw, geel en knus!
        </p>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Account aanmaken</CardTitle>
          <CardDescription>
            Vul uw gegevens in om een nieuw account te registreren.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voornaam</FormLabel>
                      <FormControl>
                        <Input placeholder="Jan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Achternaam</FormLabel>
                      <FormControl>
                        <Input placeholder="Jansen" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leeftijd (optioneel)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mailadres</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="naam@voorbeeld.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefoonnummer (optioneel)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="0612345678" {...field} />
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
                Registreren
              </Button>
            </CardFooter>
          </form>
        </Form>
        <div className="p-6 pt-0 text-center text-sm">
          Al een account?{" "}
          <Link href="/" className="underline text-primary/90 font-semibold hover:text-primary">
            Log hier in
          </Link>
        </div>
      </Card>
    </main>
  );
}
