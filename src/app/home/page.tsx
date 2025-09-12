
"use client";

import { useState } from "react";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Bus, User, Clock, Loader, X, MapPin, Info, CreditCard, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { estimateArrivalTime, EstimatedArrivalTimeInput } from "@/ai/ai-estimated-arrival-time";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

type RequestState = "idle" | "requesting" | "waiting";

export default function HomePage() {
  const [state, setState] = useState<RequestState>("idle");
  const [eta, setEta] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [user, loading] = useAuthState(auth);
  const { toast } = useToast();

  const handleRequestRide = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Locatie niet ondersteund",
        description: "Uw browser ondersteunt geen geolocatie.",
      });
      return;
    }

    setState("requesting");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const userLocation = `${latitude}, ${longitude}`;

        if (!user) {
          toast({
            variant: "destructive",
            title: "Niet ingelogd",
            description: "U moet ingelogd zijn om een rit aan te vragen.",
          });
          setState("idle");
          return;
        }

        try {
          // 1. Get user data from Firestore
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          let userName = user.email || "Onbekende gebruiker";
          let userAge = "Onbekend";

          if (userDoc.exists()) {
            const userData = userDoc.data();
            userName = `${userData.firstName} ${userData.lastName}`.trim() || userName;
            userAge = userData.age || userAge;
          }

          // 2. Save ride request to Firestore
          const rideRequestRef = doc(db, "rideRequests", `${user.uid}_${Date.now()}`);
          await setDoc(rideRequestRef, {
            userId: user.uid,
            userName: userName,
            userAge: userAge,
            location: userLocation,
            status: "pending",
            createdAt: serverTimestamp(),
            driverName: "Jan Jansen", // Add driver name
            destination: "Thuiskomst", // Add a destination
          });

          // 3. Get ETA from AI flow
          const input: EstimatedArrivalTimeInput = {
            userLocation: userLocation,
            busRoute: "Route 347", // Example value
            timeOfRequest: new Date().toISOString(),
            historicalData: "Gemiddelde snelheid 30km/u, 5-10 min vertraging in de spits.",
          };
          const result = await estimateArrivalTime(input);
          const arrivalTime = new Date(result.estimatedArrivalTime);
          const now = new Date();
          const diffMinutes = Math.round((arrivalTime.getTime() - now.getTime()) / 60000);
          
          setEta(`${diffMinutes} minuten`);
          setConfidence(result.confidence);
          setState("waiting");
          toast({
            title: "Verzoek ontvangen!",
            description: "De chauffeur is op de hoogte gebracht.",
          });

        } catch (error) {
          console.error("Error requesting ride:", error);
          toast({
            variant: "destructive",
            title: "Fout bij aanvragen",
            description: "Kon de ritaanvraag of de wachttijd niet verwerken.",
          });
          setState("idle");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast({
            variant: "destructive",
            title: "Locatiefout",
            description: "Toestemming geweigerd. Controleer de locatie-instellingen van uw browser voor deze site en geef opnieuw toestemming.",
        });
        setState("idle");
      }
    );
  };

  const handleCancel = () => {
    // Here you would add logic to update the Firestore document to "cancelled"
    setState("idle");
    setEta(null);
    setConfidence(null);
    toast({
      title: "Rit geannuleerd",
    });
  };

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4">
        <Loader className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {state === "idle" && (
        <div className="flex flex-col items-center p-4">
            <div className="flex flex-col items-center text-center mb-4">
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
            <div className="w-full max-w-sm mb-6 space-y-6">
                <Card className="w-full mt-4">
                    <CardHeader>
                        <CardTitle>Waar wilt u heen?</CardTitle>
                        <CardDescription>
                            De buurtbus haalt u op vanaf uw huidige locatie.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button size="lg" className="w-full" onClick={handleRequestRide}>
                            Roep de buurtbus op
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <Info className="h-6 w-6"/>
                            Informatie
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div>
                            <h3 className="font-semibold flex items-center gap-2 mb-2"><Clock className="h-4 w-4"/>Dienstregeling</h3>
                            <div className="flex justify-between"><span>Maandag t/m zaterdag:</span><span>08:00 - 19:00</span></div>
                            <div className="flex justify-between"><span>Zondag:</span><span>10:00 - 18:00</span></div>
                        </div>
                        <Separator />
                        <div>
                            <h3 className="font-semibold flex items-center gap-2 mb-2"><Ticket className="h-4 w-4"/>Vervoersbewijzen</h3>
                            <p className="text-muted-foreground">Kaartje kopen bij instappen: <span className="font-bold text-foreground">€1,50</span></p>
                            <p className="text-muted-foreground">Kaartjes zijn 1 uur geldig. (Alleen pinbetaling)</p>
                            <p className="mt-2 font-semibold text-destructive/90">Let op: OV-chipkaart is niet geldig.</p>
                             <p className="text-muted-foreground">Hiervoor hebben we Buurtbus pasjes.</p>
                        </div>
                        <Separator />
                        <div>
                            <h3 className="font-semibold flex items-center gap-2 mb-2"><CreditCard className="h-4 w-4"/>Buurtbus Pas</h3>
                             <p className="text-muted-foreground">Onbeperkt reizen voor <span className="font-bold text-foreground">€35 per maand</span>.</p>
                            <Button variant="outline" className="w-full mt-3" asChild>
                                <Link href="/home/buurtbus-pas">Meer informatie & Aanvragen</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      )}

      {state === "requesting" && (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-4 text-center">
          <Loader className="h-16 w-16 animate-spin text-primary" />
          <h2 className="text-xl font-semibold font-headline">
            Locatie wordt bepaald...
          </h2>
          <p className="text-muted-foreground max-w-xs">Een moment geduld, we sturen uw verzoek zo door.</p>
        </div>
      )}

      {state === "waiting" && (
        <div className="flex h-full flex-col justify-between animate-in fade-in-50 duration-500 p-4">
          <div className="flex flex-col items-center gap-6 w-full pt-8">
            <h2 className="text-2xl font-bold text-primary font-headline">
              Chauffeur is onderweg!
            </h2>
            <Card className="w-full max-w-sm text-left">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Bus className="h-6 w-6 text-primary" />
                  <span>Uw Rit</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Wordt opgehaald op</p>
                    <p className="font-semibold">Uw huidige locatie</p>
                  </div>
                </div>
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
          </div>
          <div className="pb-4">
             <Button
                variant="destructive"
                size="lg"
                className="w-full max-w-sm mx-auto"
                onClick={handleCancel}
            >
                <X className="mr-2 h-5 w-5" />
                Rit Annuleren
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
