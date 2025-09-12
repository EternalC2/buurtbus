
"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { db, auth } from "@/lib/firebase";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, User, Bus, Clock, Loader2, CheckCircle, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RideRequest {
  id: string;
  userName: string;
  location: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  createdAt: any;
  driverId?: string;
  driverName?: string;
  destination: string;
}

export default function DriverDashboardPage() {
  const [driver, loadingDriver] = useAuthState(auth);
  const { toast } = useToast();

  const [pendingRequests, setPendingRequests] = useState<RideRequest[]>([]);
  const [activeRide, setActiveRide] = useState<RideRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!driver) return;

    // Listener for pending requests
    const pendingQuery = query(collection(db, "rideRequests"), where("status", "==", "pending"));
    const unsubscribePending = onSnapshot(pendingQuery, (querySnapshot) => {
      const requests: RideRequest[] = [];
      querySnapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() } as RideRequest);
      });
      setPendingRequests(requests);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching pending requests: ", error);
      toast({ variant: "destructive", title: "Fout", description: "Kon openstaande verzoeken niet ophalen." });
      setIsLoading(false);
    });

    // Listener for this driver's accepted ride
    const acceptedQuery = query(
      collection(db, "rideRequests"),
      where("driverId", "==", driver.uid),
      where("status", "==", "accepted")
    );
    const unsubscribeAccepted = onSnapshot(acceptedQuery, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const ride = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as RideRequest;
        setActiveRide(ride);
      } else {
        setActiveRide(null);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching active ride: ", error);
      toast({ variant: "destructive", title: "Fout", description: "Kon actieve rit niet ophalen." });
      setIsLoading(false);
    });


    return () => {
      unsubscribePending();
      unsubscribeAccepted();
    };
  }, [driver, toast]);

  const handleAcceptRide = async (rideId: string) => {
    if (!driver || activeRide) {
      toast({
        variant: "destructive",
        title: "Kan niet accepteren",
        description: activeRide ? "U heeft al een actieve rit." : "Chauffeur niet gevonden."
      });
      return;
    }
    
    const rideRef = doc(db, "rideRequests", rideId);
    try {
      await updateDoc(rideRef, {
        status: "accepted",
        driverId: driver.uid,
        driverName: driver.displayName || "Onbekende Chauffeur",
      });
      toast({ title: "Rit geaccepteerd!", description: "De passagier is op de hoogte gebracht." });
    } catch (error) {
      console.error("Error accepting ride: ", error);
      toast({ variant: "destructive", title: "Fout", description: "Kon de rit niet accepteren." });
    }
  };

  const handleFinishRide = async (rideId: string) => {
    const rideRef = doc(db, "rideRequests", rideId);
    try {
      await updateDoc(rideRef, {
        status: "completed",
      });
      toast({ title: "Rit voltooid!", description: "Bedankt voor uw inzet." });
      setActiveRide(null); // Clear the active ride from state immediately
    } catch (error) {
      console.error("Error completing ride: ", error);
      toast({ variant: "destructive", title: "Fout", description: "Kon de rit niet voltooien." });
    }
  };
  
  const getGoogleMapsLink = (location: string) => {
    const [lat, lon] = location.split(', ');
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  };


  return (
    <div className="flex flex-col h-full bg-secondary/40">
      <header className="flex items-center justify-between p-4 border-b bg-background">
        <div className="w-10"></div>
        <h1 className="text-xl font-bold">Chauffeurspaneel</h1>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft />
          </Link>
        </Button>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        {loadingDriver || isLoading ? (
           <div className="flex justify-center items-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">

            {/* Active Ride Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bus className="text-primary"/> 
                  Huidige Rit
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeRide ? (
                  <div className="space-y-4">
                     <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <User className="h-6 w-6 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">{activeRide.userName}</p>
                                <p className="text-sm text-muted-foreground">Bestemming: {activeRide.destination}</p>
                            </div>
                        </div>
                         <Button asChild variant="outline" size="sm">
                            <a href={getGoogleMapsLink(activeRide.location)} target="_blank" rel="noopener noreferrer">
                                <MapPin className="mr-2 h-4 w-4"/> Navigeer
                            </a>
                        </Button>
                    </div>
                    <Button className="w-full" size="lg" onClick={() => handleFinishRide(activeRide.id)}>
                        <CheckCircle className="mr-2 h-5 w-5"/> Rit Afronden
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">Er is geen actieve rit.</p>
                )}
              </CardContent>
            </Card>
            
            {/* Pending Requests Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="text-primary"/>
                    Inkomende Verzoeken
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingRequests.length > 0 ? (
                    pendingRequests.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                        <div className="flex items-center gap-3">
                          <User className="h-6 w-6 text-muted-foreground" />
                          <div>
                            <p className="font-semibold">{req.userName}</p>
                            <p className="text-sm text-muted-foreground">Bestemming: {req.destination}</p>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => handleAcceptRide(req.id)} disabled={!!activeRide}>
                            {!!activeRide ? 'Niet beschikbaar' : 'Accepteren'}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Geen nieuwe verzoeken.</p>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        )}
      </main>
    </div>
  );
}

    