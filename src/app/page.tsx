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
import { Bus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
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
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">E-mailadres</Label>
            <Input id="email" type="email" placeholder="naam@voorbeeld.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Wachtwoord</Label>
            <Input id="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" asChild>
            <Link href="/home">Inloggen</Link>
          </Button>
          <div className="text-center text-sm">
            Nog geen account?{" "}
            <Link href="/register" className="underline text-primary-foreground/80 font-semibold hover:text-primary-foreground">
              Registreer hier
            </Link>
          </div>
          <Separator className="my-2" />
          <div className="flex w-full gap-2">
            <Button variant="outline" className="w-full" asChild>
                <Link href="/driver">Chauffeur</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
                <Link href="/admin">Beheerder</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
