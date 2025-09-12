import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, User, Bus, Clock } from "lucide-react";

export default function DriverDashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Chauffeurspaneel</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 p-4 md:p-6 bg-secondary/40">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Huidige Rit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Er is geen actieve rit.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Inkomende Verzoeken</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
                  <div className="flex items-center gap-3">
                    <User className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">Mevr. de Vries</p>
                      <p className="text-sm text-muted-foreground">Kerkstraat 12</p>
                    </div>
                  </div>
                  <Button size="sm">Accepteren</Button>
                </div>
                <p className="text-sm text-muted-foreground text-center">Geen verdere verzoeken.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
