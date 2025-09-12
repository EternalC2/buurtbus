
"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { db, auth } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface Trip {
  id: string;
  date: string;
  from: string;
  to: string;
  driver: string;
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
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const fetchedTrips: Trip[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Ensure createdAt exists and is a Timestamp before converting
          const date = data.createdAt && data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : new Date();

          fetchedTrips.push({
            id: doc.id,
            date: format(date, "d MMMM yyyy, HH:mm", { locale: nl }),
            from: "Huidige locatie", // Placeholder, as we only store one location
            to: data.destination || "Bestemming onbekend",
            driver: data.driverName || "Chauffeur onbekend",
          });
        });

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
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{trip.from} &rarr; {trip.to}</p>
                  <p className="text-sm text-muted-foreground">{trip.date}</p>
                   <p className="text-sm text-muted-foreground">Chauffeur: {trip.driver}</p>
                </div>
                <MoreHorizontal className="text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground mt-8">
          U heeft nog geen ritten gemaakt.
        </p>
      )}
    </div>
  );
}
