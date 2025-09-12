"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, User, Clock, Loader, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { estimateArrivalTime, EstimatedArrivalTimeInput } from "@/ai/ai-estimated-arrival-time";

type RequestState = "idle" | "requesting" | "waiting";

export default function HomePage() {
  const [state, setState] = useState<RequestState>("idle");
  const [eta, setEta] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [requestTime, setRequestTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set the time on the client to avoid hydration mismatch
    setRequestTime(new Date());
  }, []);

  const handleRequest = async () => {
    if (!requestTime) return;
    setState("requesting");
    try {
      // Hardcoded values for demonstration
      const input: EstimatedArrivalTimeInput = {
        userLocation: "52.370216, 4.895168", // Amsterdam Centraal
        busRoute: "Route 347",
        timeOfRequest: requestTime.toISOString(),
        historicalData: "Average speed 30km/h, common 5-10 min delay during peak hours.",
      };
      const result = await estimateArrivalTime(input);
      const arrivalTime = new Date(result.estimatedArrivalTime);
      const now = new Date();
      const diffMinutes = Math.round((arrivalTime.getTime() - now.getTime()) / 60000);
      
      setEta(`${diffMinutes} minuten`);
      setConfidence(result.confidence);
      setState("waiting");
    } catch (error) {
      console.error("Error estimating arrival time:", error);
      // Fallback to random ETA on error
      const randomEta = Math.floor(Math.random() * 10) + 5;
      setEta(`~ ${randomEta} minuten`);
      setConfidence(null);
      setState("waiting");
    }
  };

  const handleCancel = () => {
    setState("idle");
    setEta(null);
    setConfidence(null);
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
          <p className="text-muted-foreground">Een moment geduld, we berekenen uw wachttijd.</p>
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
                  <p className="font-semibold">{eta || '...'}</p>
                   {confidence !== null && (
                    <p className="text-xs text-muted-foreground">
                      Betrouwbaarheid: {Math.round(confidence * 100)}%
                    </p>
                  )}
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
