
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";


const formSchema = z.object({
  firstName: z.string().min(2, { message: "Voornaam moet minimaal 2 karakters lang zijn." }),
  lastName: z.string().min(2, { message: "Achternaam moet minimaal 2 karakters lang zijn." }),
  age: z.string().optional(),
  email: z.string().email({ message: "Voer een geldig e-mailadres in." }),
  phone: z.string().optional(),
  password: z.string().min(6, { message: "Wachtwoord moet minimaal 6 karakters lang zijn." }),
  terms: z.boolean().refine((val) => val === true, {
    message: "U moet de algemene voorwaarden accepteren om door te gaan.",
  }),
  isMindervalide: z.boolean().optional().default(false),
  beperking: z.string().optional(),
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
      terms: false,
      isMindervalide: false,
      beperking: "",
    },
  });

  const isMindervalide = form.watch("isMindervalide");

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
        role: "user",
        isMindervalide: values.isMindervalide,
        beperking: values.beperking || "",
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
              <FormField
                control={form.control}
                name="isMindervalide"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Heb je een beperking of ondersteuningsbehoefte waar wij rekening mee moeten houden?
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              {isMindervalide && (
                 <FormField
                  control={form.control}
                  name="beperking"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Als je ja hebt aangevinkt, kun je hieronder kort aangeven welke ondersteuning of aanpassingen voor jou belangrijk zijn:</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Bijv. rolstoelgebruiker, slechtziend" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
               <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Ik ga akkoord met de{" "}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <span className="underline cursor-pointer text-primary/90 hover:text-primary">
                              algemene voorwaarden
                            </span>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Algemene Voorwaarden</AlertDialogTitle>
                              <AlertDialogDescription className="max-h-[60vh] overflow-y-auto text-left">
                                <p className="mb-2">Laatst bijgewerkt: [Datum]</p>
                                <p className="mb-4">Welkom bij Buurtbus. Lees deze voorwaarden zorgvuldig door voordat u onze service gebruikt.</p>
                                <h3 className="font-bold mb-2">1. Acceptatie van Voorwaarden</h3>
                                <p className="mb-4">Door gebruik te maken van de Buurtbus app, gaat u akkoord met deze algemene voorwaarden. Als u niet akkoord gaat, dient u de app niet te gebruiken.</p>
                                <h3 className="font-bold mb-2">2. De Service</h3>
                                <p className="mb-4">Buurtbus is een platform dat reizigers in contact brengt met vrijwillige chauffeurs. De service is afhankelijk van de beschikbaarheid van vrijwilligers en er kunnen geen garanties worden gegeven over de beschikbaarheid of wachttijden.</p>
                                <h3 className="font-bold mb-2">3. Gebruikersaccount</h3>
                                <p className="mb-4">U bent verantwoordelijk voor het geheimhouden van uw accountgegevens en voor alle activiteiten die onder uw account plaatsvinden. U dient ons onmiddellijk op de hoogte te stellen van elk ongeoorloofd gebruik van uw account.</p>
                                <h3 className="font-bold mb-2">4. Beperking van Aansprakelijkheid</h3>
                                <p className="mb-4">De service wordt geleverd "zoals deze is". Wij zijn niet aansprakelijk voor enige directe of indirecte schade die voortvloeit uit het gebruik van of de onmogelijkheid tot het gebruik van de service.</p>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogAction>Sluiten</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        .
                      </FormLabel>
                      <FormMessage />
                    </div>
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
