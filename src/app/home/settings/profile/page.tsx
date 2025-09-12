
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  firstName: z.string().min(2, { message: "Voornaam moet minimaal 2 karakters lang zijn." }),
  lastName: z.string().min(2, { message: "Achternaam moet minimaal 2 karakters lang zijn." }),
  age: z.string().optional(),
  isMindervalide: z.boolean().optional().default(false),
  beperking: z.string().optional(),
});

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, userLoading] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      age: "",
      isMindervalide: false,
      beperking: "",
    },
  });

  const isMindervalide = form.watch("isMindervalide");

  useEffect(() => {
    async function fetchUserData() {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          form.reset({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            age: userData.age || "",
            isMindervalide: userData.isMindervalide || false,
            beperking: userData.beperking || "",
          });
        }
        setIsFetching(false);
      } else if (!userLoading) {
        // Not logged in
        router.push("/");
      }
    }

    fetchUserData();
  }, [user, userLoading, form, router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    setIsLoading(true);

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        firstName: values.firstName,
        lastName: values.lastName,
        age: values.age || "",
        isMindervalide: values.isMindervalide,
        beperking: values.beperking || "",
      });

      const displayName = `${values.firstName} ${values.lastName}`;
      if (user.displayName !== displayName) {
        await updateProfile(user, { displayName });
      }

      toast({
        title: "Profiel bijgewerkt",
        description: "Uw gegevens zijn succesvol opgeslagen.",
      });
      router.push("/home/settings");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Kon uw profiel niet bijwerken.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (userLoading || isFetching) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/home/settings">
            <ArrowLeft />
            <span className="sr-only">Terug naar Instellingen</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold font-headline ml-4">Profiel bewerken</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Uw gegevens</CardTitle>
          <CardDescription>Pas hier uw persoonlijke informatie aan.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
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
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leeftijd</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Uw leeftijd" {...field} />
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
               <Button type="submit" className="w-full !mt-6" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Wijzigingen opslaan
              </Button>
            </CardContent>
          </form>
        </Form>
      </Card>
    </div>
  );
}
