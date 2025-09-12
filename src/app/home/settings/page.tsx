import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, User, Bell, FileText, Shield } from "lucide-react";
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold font-headline mb-6">Instellingen</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account &amp; Juridisch</CardTitle>
            <CardDescription>Beheer uw account en bekijk ons beleid.</CardDescription>
          </CardHeader>
          <CardContent>
            <button className="flex w-full items-center justify-between rounded-md p-3 hover:bg-secondary">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <span>Profiel bewerken</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
            <Separator className="my-2" />
            <button className="flex w-full items-center justify-between rounded-md p-3 hover:bg-secondary">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span>Algemene Voorwaarden</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
            <Separator className="my-2" />
            <button className="flex w-full items-center justify-between rounded-md p-3 hover:bg-secondary">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span>Privacybeleid (AVG)</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificaties</CardTitle>
            <CardDescription>Stel uw meldingsvoorkeuren in.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-md p-3">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span>Pushnotificaties</span>
              </div>
              <Switch defaultChecked={true} aria-label="Pushnotificaties" />
            </div>
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full" asChild>
            <Link href="/">Uitloggen</Link>
        </Button>
      </div>
    </div>
  );
}
