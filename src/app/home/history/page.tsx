import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";

const mockTrips = [
  {
    date: "Vandaag, 14:32",
    from: "Supermarkt Albert Heijn",
    to: "Thuiskomst",
    driver: "Jan J.",
  },
  {
    date: "Gisteren, 10:15",
    from: "Bibliotheek",
    to: "Thuiskomst",
    driver: "Ingrid V.",
  },
  {
    date: "12 mei 2024",
    from: "Thuiskomst",
    to: "Medisch Centrum",
    driver: "Jan J.",
  },
  {
    date: "10 mei 2024",
    from: "Station",
    to: "Thuiskomst",
    driver: "Kees P.",
  },
];

export default function HistoryPage() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold font-headline mb-6">Ritgeschiedenis</h1>
      <div className="space-y-4">
        {mockTrips.map((trip, index) => (
          <Card key={index}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{trip.from} &rarr; {trip.to}</p>
                <p className="text-sm text-muted-foreground">{trip.date}</p>
              </div>
              <MoreHorizontal className="text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
