"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, User, Clock, Loader, X } from "lucide-react";
import { cn } from "@/lib/utils";

type RequestState = "idle" | "requesting" | "waiting";

export default function HomePage() {
  const [state, setState] = useState<RequestState>("idle");
  const [eta, setEta] = useState<number | null>(null);

  useEffect(() => {
    if (state === "requesting") {
      const timer = setTimeout(() => {
        // Simulate AI ETA calculation
        setEta(Math.floor(Math.random() * 10) + 5);
        setState("waiting");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const handleRequest = () => {
    setState("requesting");
  };

  const handleCancel = () => {
    setState("idle");
    setEta(null);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center p-4 pt-10 text-center">
      {state === "idle" && (
        <>
          <h1 className="text-2xl font-bold font-headline mb-4">Welkom!</h1>
          <p className="text-muted-foreground mb-12 max-w-xs">
            Druk op de knop om de buurtbus op te roepen naar uw huidige locatie.
          </p>
          <button
            onClick={handleRequest}
            className={cn(
                "relative flex flex-col items-center justify-center w-48 h-48 rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95 animate-pulse-ring"
            )}
            aria-label="Roep de bus op"
          >
            <Bus className="h-16 w-16 mb-2" />
            <span className="font-bold text-lg">Roep de bus op</span>
          </button>
        </>
      )}

      {state === "requesting" && (
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-16 w-16 animate-spin text-primary" />
          <h2 className="text-xl font-semibold font-headline">
            Verzoek wordt verstuurd...
          </h2>
          <p className="text-muted-foreground">Een moment geduld.</p>
        </div>
      )}

      {state === "waiting" && (
        <div className="flex flex-col items-center gap-6 w-full animate-in fade-in-50 duration-500">
          <h2 className="text-2xl font-bold text-accent-foreground font-headline">
            Chauffeur is onderweg!
          </h2>
          <Card className="w-full max-w-sm text-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Bus className="h-6 w-6 text-accent-foreground" />
                <span>Uw Rit</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Verwachte aankomsttijd</p>
                  <p className="font-semibold">{`~ ${eta} minuten`}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Chauffeur</p>
                  <p className="font-semibold">Jan Jansen</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Button
            variant="destructive"
            size="lg"
            className="w-full max-w-sm"
            onClick={handleCancel}
          >
            <X className="mr-2 h-5 w-5" />
            Rit Annuleren
          </Button>
        </div>
      )}
    </div>
  );
}
