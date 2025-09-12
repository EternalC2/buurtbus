
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useState } from "react";

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
import { Bus, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


const formSchema = z.object({
  email: z.string().email({ message: "Voer een geldig e-mailadres in." }),
  password: z.string().min(1, { message: "Wachtwoord is vereist." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({
        variant: "destructive",
        title: "E-mailadres vereist",
        description: "Voer een e-mailadres in om uw wachtwoord opnieuw in te stellen.",
      });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({
        title: "E-mail verzonden",
        description: "Controleer uw inbox voor een link om uw wachtwoord opnieuw in te stellen.",
      });
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
       toast({
        variant: "destructive",
        title: "Verzenden mislukt",
        description: "Kon de e-mail voor wachtwoordherstel niet verzenden. Controleer het e-mailadres.",
      });
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    signInWithEmailAndPassword(auth, values.email, values.password)
      .then(() => {
        toast({
          title: "Succesvol ingelogd!",
          description: "U wordt nu doorgestuurd.",
        });
        router.push("/home");
      })
      .catch((error: any) => {
        console.error("Error signing in:", error);
        let errorMessage = "Er is een onbekende fout opgetreden.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          errorMessage = "Ongeldige inloggegevens. Controleer uw e-mail en wachtwoord.";
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = "Het ingevoerde e-mailadres is ongeldig."
        }
        toast({
          variant: "destructive",
          title: "Inloggen mislukt",
          description: errorMessage,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <main className="flex min-h-full flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="bg-primary rounded-full p-4 mb-4">
          <Bus className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 font-headline">
          Buurtbus Connect
        </h1>
        <p className="text-muted-foreground mt-2">
          De buurtbus, altijd dichtbij.
        </p>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Inloggen</CardTitle>
          <CardDescription>
            Voer uw e-mailadres en wachtwoord in om door te gaan.
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
                      <Input type="email" placeholder="naam@voorbeeld.com" {...field} />
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
                    <div className="flex items-center justify-between">
                      <FormLabel>Wachtwoord</FormLabel>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button 
                              type="button"
                              variant="link" 
                              className="text-xs p-0 h-auto text-primary/80 font-semibold hover:text-primary-foreground"
                              onClick={() => setResetEmail(form.getValues("email"))}
                            >
                              Wachtwoord vergeten?
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Wachtwoord opnieuw instellen</AlertDialogTitle>
                            <AlertDialogDescription>
                              Voer uw e-mailadres in om een link voor wachtwoordherstel te ontvangen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <Input 
                            type="email" 
                            placeholder="naam@voorbeeld.com" 
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                          />
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuleren</AlertDialogCancel>
                            <AlertDialogAction onClick={handlePasswordReset}>Verstuur E-mail</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
                Inloggen
              </Button>
            </CardFooter>
          </form>
        </Form>
        <div className="px-6 pb-6 text-center text-sm">
          Nog geen account?{" "}
          <Link href="/register" className="underline text-primary-foreground/80 font-semibold hover:text-primary-foreground">
            Registreer hier
          </Link>
        </div>
        <Separator className="my-0" />
        <div className="p-6 flex w-full gap-2">
            <Button variant="outline" className="w-full" asChild>
                <Link href="/driver">Chauffeur</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
                <Link href="/admin">Beheerder</Link>
            </Button>
        </div>
      </Card>
    </main>
  );
}
