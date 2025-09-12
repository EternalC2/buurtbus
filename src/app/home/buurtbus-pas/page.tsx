
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function BuurtbusPasPage() {
  return (
    <div className="p-4 md:p-6">
       <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/home">
            <ArrowLeft />
            <span className="sr-only">Terug naar Home</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold font-headline ml-4">Buurtbus Pas</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <CreditCard className="h-7 w-7 text-primary" />
            <span>Onbeperkt Reizen voor €35 p/m</span>
          </CardTitle>
          <CardDescription>
            Vraag vandaag nog uw persoonlijke Buurtbus Pas aan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Snel en eenvoudig instappen</h3>
            <p>
              Met de Buurtbus Pas hoeft u niet meer bij elke rit af te rekenen. U stapt in, toont uw pas en kunt direct gaan zitten. Eenvoudiger kan niet.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Bus oproepen zonder app</h3>
            <p>
              De pasjes kunt u ook gebruiken bij bushaltes waar een paal staat met een kaartlezer. Hiermee kunt u een buurtbus oproepen, ideaal voor mensen die de app niet gebruiken of bij zich hebben.
            </p>
          </div>

          <div className="space-y-2 p-4 bg-secondary/50 rounded-lg border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Waarom een pas en geen knop?
            </h3>
            <p className="text-sm">
             We gebruiken pasjes bij de oproeppalen om misbruik te voorkomen. Dit zorgt ervoor dat alleen serieuze reizigers de bus oproepen en voorkomt ongewenst en verstorend gedrag.
            </p>
          </div>

          <Button size="lg" className="w-full">
            Pas Aanvragen
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}
