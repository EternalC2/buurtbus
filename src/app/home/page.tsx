
"use client";

import { useState, useEffect } from "react";
import { doc, setDoc, serverTimestamp, getDoc, updateDoc, onSnapshot, DocumentData } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Bus, User, Clock, Loader, X, MapPin, Info, CreditCard, Ticket, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type RequestState = "idle" | "requesting" | "waiting";

const destinationSuggestions = [
  "Station Hoogeveen",
  "Ziekenhuis Bethesda",
  "Centrum",
  "Winkelcentrum De Weide",
  "Winkelcentrum Grote Beer",
  "Het Drenthe College",
  "Fluitenberg",
  "Pesse",
  "Noordscheschut",
  "Hollandscheveld",
  "Elim",
  "Nieuwlande",
  "Tiendeveen",
];

const GUEST_RIDE_ID_KEY = 'buurtbus_guestRideId';

export default function HomePage() {
  const [state, setState] = useState<RequestState>("idle");
  const [user, loading] = useAuthState(auth);
  const { toast } = useToast();
  const [isGuestNameDialogOpen, setIsGuestNameDialogOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [destination, setDestination] = useState("");
  const [rideRequestId, setRideRequestId] = useState<string | null>(null);
  const [activeRideDetails, setActiveRideDetails] = useState<DocumentData | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Check for guest/user ride ID in localStorage/state on initial load
  useEffect(() => {
    if (loading) return; // Wait until user auth state is loaded

    let initialRideId: string | null = null;
    let isGuest = false;

    if (user) {
      // We might need to implement logic to fetch user's ongoing ride from firestore
      // For now, we keep it simple. If the page reloads, the state is lost for logged-in user.
    } else {
      // It's a guest, check localStorage
      if (typeof window !== 'undefined') {
        initialRideId = localStorage.getItem(GUEST_RIDE_ID_KEY);
        isGuest = true;
      }
    }
    
    if (initialRideId) {
      setRideRequestId(initialRideId);
      setState("waiting");
      // Set minimal activeRideDetails from localStorage for guests
      setActiveRideDetails({
          status: "pending",
          destination: "Uw bestemming",
          driverName: "Wordt toegewezen..."
      });

      // If it's a guest, we don't start a listener due to permissions
      if (isGuest) {
        return;
      }
    }
  }, [user, loading]);

  useEffect(() => {
    // This effect is only for logged-in users to get live updates
    if (state !== 'waiting' || !rideRequestId || !user) {
        return;
    }

    const rideRef = doc(db, "rideRequests", rideRequestId);
    const unsubscribe = onSnapshot(rideRef, (doc) => {
        if (doc.exists()) {
            const rideData = doc.data();
            setActiveRideDetails(rideData);

            if (rideData.status === 'completed' || rideData.status === 'cancelled') {
                setState("idle");
                setRideRequestId(null);
                setActiveRideDetails(null);
                toast({ title: rideData.status === 'completed' ? "Rit voltooid!" : "Rit geannuleerd." });
            }
        } else {
            // Document was deleted or does not exist
            setState("idle");
            setRideRequestId(null);
            setActiveRideDetails(null);
        }
    }, (error) => {
        console.error("Error listening to ride status:", error);
        toast({
            variant: "destructive",
            title: "Verbindingsfout",
            description: "Kon de status van de rit niet live bijwerken."
        });
        setState("idle");
    });

    return () => unsubscribe();
  }, [state, rideRequestId, toast, user]);


  const handleRequestRide = () => {
    if (!destination.trim()) {
      toast({
        variant: "destructive",
        title: "Bestemming vereist",
        description: "Voer alstublieft een bestemming in.",
      });
      return;
    }
    if (!user) {
      setIsGuestNameDialogOpen(true);
      return;
    }
    initiateRideRequest();
  };

  const handleGuestRequest = () => {
    if (!guestName.trim()) {
      toast({
        variant: "destructive",
        title: "Naam vereist",
        description: "Voer alstublieft uw naam in.",
      });
      return;
    }
    setIsGuestNameDialogOpen(false);
    initiateRideRequest();
  };
  
  const initiateRideRequest = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Locatie niet ondersteund",
        description: "Uw browser ondersteunt geen geolocatie.",
      });
      return;
    }
     if (!destination.trim()) {
      toast({
        variant: "destructive",
        title: "Bestemming vereist",
        description: "Voer alstublieft een bestemming in.",
      });
      return;
    }

    setState("requesting");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const userLocation = `${latitude}, ${longitude}`;

        try {
          const requestId = user ? `${user.uid}_${Date.now()}` : `guest_${Date.now()}`;
          setRideRequestId(requestId);

          let rideData: any = {
            location: userLocation,
            status: "pending",
            createdAt: serverTimestamp(),
            destination: destination,
          };

          if (user) {
             const userDocRef = doc(db, "users", user.uid);
             const userDoc = await getDoc(userDocRef);
             
             let userName = user.displayName || user.email || "Onbekende gebruiker";
             let userAge = "Onbekend";
             let isMindervalide = false;
             let beperking = "";

             if (userDoc.exists()) {
                const userData = userDoc.data();
                userName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userName;
                userAge = userData.age || userAge;
                isMindervalide = userData.isMindervalide || false;
                beperking = userData.beperking || "";
             }
             
             rideData = {
                ...rideData,
                userId: user.uid,
                userName: userName,
                userAge: userAge,
                isMindervalide: isMindervalide,
                beperking: beperking,
             };
          } else {
            // Guest user
            rideData = {
              ...rideData,
              userId: "guest",
              userName: guestName,
              userAge: "Onbekend",
              isMindervalide: false,
              beperking: "",
              driverName: "Wordt toegewezen..."
            };
            if (typeof window !== 'undefined') {
              localStorage.setItem(GUEST_RIDE_ID_KEY, requestId);
            }
          }

          const rideRequestRef = doc(db, "rideRequests", requestId);
          await setDoc(rideRequestRef, rideData);

          setActiveRideDetails(rideData);
          setState("waiting");
          setGuestName("");
          setDestination("");
          toast({
            title: "Verzoek ontvangen!",
            description: "De chauffeur is op de hoogte gebracht.",
          });

        } catch (error) {
          console.error("Error requesting ride:", error);
          toast({
            variant: "destructive",
            title: "Fout bij aanvragen",
            description: "Kon de ritaanvraag niet verwerken.",
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

  const handleCancel = async () => {
    // The rideRequestId can come from state (for logged-in users) or localStorage (for guests)
    const rideId = rideRequestId || (typeof window !== 'undefined' ? localStorage.getItem(GUEST_RIDE_ID_KEY) : null);
    if (!rideId) {
        toast({
            variant: "destructive",
            title: "Fout",
            description: "Kan rit ID niet vinden om te annuleren.",
        });
        return;
    };

    setIsCancelling(true);

    try {
      const rideRef = doc(db, "rideRequests", rideId);
      await updateDoc(rideRef, {
        status: "cancelled",
      });

      toast({
        title: "Rit geannuleerd",
      });

      setState("idle");
      setRideRequestId(null);
      setActiveRideDetails(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(GUEST_RIDE_ID_KEY);
      }
    } catch (error) {
        console.error("Error cancelling ride:", error);
        toast({
            variant: "destructive",
            title: "Fout bij annuleren",
            description: "Kon de rit niet annuleren. Probeer het opnieuw.",
        });
    } finally {
        setIsCancelling(false);
    }
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
        <div className="flex flex-col p-4 flex-1">
            <div className="flex flex-col items-center text-center mb-6">
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
            
            <div className="space-y-4">
                <Card className="w-full mt-4">
                    <CardHeader>
                        <CardTitle>Waar wilt u heen?</CardTitle>
                        <CardDescription>
                            De buurtbus haalt u op vanaf uw huidige locatie.
                        </CardDescription>
                    </CardHeader>
                     <CardContent>
                      <div className="space-y-4">
                        <div>
                            <Label htmlFor="destination">Bestemming</Label>
                            <Input
                            id="destination"
                            placeholder="Bijv. Supermarkt, Kerk, Station"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Suggesties</Label>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {destinationSuggestions.map((suggestion) => (
                                    <Badge 
                                        key={suggestion}
                                        variant="outline"
                                        className="cursor-pointer hover:bg-accent/50"
                                        onClick={() => setDestination(suggestion)}
                                    >
                                        {suggestion}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                      </div>
                    </CardContent>
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

      {state === "waiting" && activeRideDetails && (
        <div className="flex h-full flex-col justify-between animate-in fade-in-50 duration-500 p-4">
          <div className="flex flex-col items-center gap-6 w-full pt-8">
            <h2 className="text-2xl font-bold text-primary font-headline">
              {activeRideDetails.status === 'accepted' ? 'Chauffeur is onderweg!' : 'Chauffeur is op de hoogte!'}
            </h2>
            <Card className="w-full max-w-sm text-left">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Bus className="h-6 w-6 text-primary" />
                  <span>Uw Rit</span>
                </CardTitle>
                <CardDescription>
                    {activeRideDetails.status === 'accepted' 
                        ? 'Uw rit is bevestigd. De chauffeur komt eraan.'
                        : 'De chauffeur heeft uw verzoek ontvangen.'
                    }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bestemming</p>
                    <p className="font-semibold">{activeRideDetails.destination}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                    {activeRideDetails.status === 'accepted' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className={cn("font-semibold", activeRideDetails.status === 'accepted' && "text-green-600")}>
                        {activeRideDetails.status === 'pending' && 'Wachtend op acceptatie'}
                        {activeRideDetails.status === 'accepted' && 'Geaccepteerd'}
                    </p>
                  </div>
                </div>
                 <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Chauffeur</p>
                    <p className="font-semibold">
                      {activeRideDetails.driverName || 'Wordt toegewezen...'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="pb-4 flex justify-center">
             <Button
                variant="destructive"
                size="lg"
                className="w-full max-w-sm"
                onClick={handleCancel}
                disabled={isCancelling}
            >
                {isCancelling ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <X className="mr-2 h-5 w-5" />}
                Rit Annuleren
            </Button>
          </div>
        </div>
      )}
      
      <AlertDialog open={isGuestNameDialogOpen} onOpenChange={setIsGuestNameDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Doorgaan als Gast</AlertDialogTitle>
            <AlertDialogDescription>
              Om een rit aan te vragen als gast, hebben we uw naam nodig zodat de chauffeur u kan herkennen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input 
            type="text" 
            placeholder="Voer uw naam in" 
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setGuestName("")}>Annuleren</AlertDialogCancel>
            <AlertDialogAction onClick={handleGuestRequest}>Rit Aanvragen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
