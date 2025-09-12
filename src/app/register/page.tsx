"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center p-6">
       <Card className="w-full max-w-sm">
        <CardHeader>
           <CardTitle className="text-2xl">Account aanmaken</CardTitle>
          <CardDescription>
            Vul uw gegevens in om een nieuw account te registreren.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Volledige naam</Label>
            <Input id="name" placeholder="Jan Jansen" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">E-mailadres</Label>
            <Input id="email" type="email" placeholder="naam@voorbeeld.com" required />
          </div>
           <div className="grid gap-2">
            <Label htmlFor="phone">Telefoonnummer (optioneel)</Label>
            <Input id="phone" type="tel" placeholder="0612345678" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Wachtwoord</Label>
            <Input id="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" asChild>
            <Link href="/home">Registreren</Link>
          </Button>
          <div className="text-center text-sm">
            Al een account?{" "}
            <Link href="/" className="underline text-primary-foreground/80 font-semibold hover:text-primary-foreground">
              Log hier in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
