
"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { db, auth } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface Trip {
  id: string;
  date: string;
  from: string;
  to: string;
  driver: string;
  status: string;
  createdAt: Date;
}

export default function HistoryPage() {
  const [user, userLoading] = useAuthState(auth);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "rideRequests"),
          where("userId", "==", user.uid),
          where("status", "==", "completed")
        );

        const querySnapshot = await getDocs(q);
        const fetchedTrips: Trip[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt && data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : new Date();

          fetchedTrips.push({
            id: doc.id,
            date: format(createdAt, "d MMMM yyyy, HH:mm", { locale: nl }),
            from: "Huidige locatie", // Placeholder, as we only store one location
            to: data.destination || "Bestemming onbekend",
            driver: data.driverName || "Chauffeur onbekend",
            status: data.status || "Onbekend",
            createdAt: createdAt
          });
        });

        // Sort trips on the client-side
        fetchedTrips.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        setTrips(fetchedTrips);
      } catch (error) {
        console.error("Error fetching ride history:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!userLoading) {
      fetchHistory();
    }
  }, [user, userLoading]);

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold font-headline mb-6">Ritgeschiedenis</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : trips.length > 0 ? (
        <div className="space-y-4">
          {trips.map((trip) => (
            <Card key={trip.id}>
              <CardContent className="p-4 flex items-start justify-between">
                <div className="flex items-center gap-4">
                   <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                   <div>
                    <p className="font-semibold">{trip.from} &rarr; {trip.to}</p>
                    <p className="text-sm text-muted-foreground">{trip.date}</p>
                    <p className="text-sm text-muted-foreground">Chauffeur: {trip.driver}</p>
                  </div>
                </div>
                <Badge variant="outline" className="capitalize text-green-600 border-green-500">
                  Voltooid
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground mt-8">
          U heeft nog geen voltooide ritten.
        </p>
      )}
    </div>
  );
}
