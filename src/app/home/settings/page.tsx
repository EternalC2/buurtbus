
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, User, Bell, FileText, Shield, LogOut, CreditCard, Loader2, LogIn, Eye, Type } from "lucide-react";
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";


export default function SettingsPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const { toast } = useToast();
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isLargeText, setIsLargeText] = useState(false);

  useEffect(() => {
    const highContrastValue = localStorage.getItem('high-contrast-mode') === 'true';
    setIsHighContrast(highContrastValue);
    if (highContrastValue) {
      document.documentElement.classList.add('high-contrast');
    }

    const largeTextValue = localStorage.getItem('large-text-mode') === 'true';
    setIsLargeText(largeTextValue);
    if (largeTextValue) {
      document.documentElement.classList.add('large-text');
    }
  }, []);

  const handleHighContrastToggle = (enabled: boolean) => {
    setIsHighContrast(enabled);
    localStorage.setItem('high-contrast-mode', String(enabled));
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  const handleLargeTextToggle = (enabled: boolean) => {
    setIsLargeText(enabled);
    localStorage.setItem('large-text-mode', String(enabled));
    if (enabled) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
  };


  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Succesvol uitgelogd",
      });
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Kon niet uitloggen. Probeer het opnieuw.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold font-headline mb-6">Instellingen</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account & Juridisch</CardTitle>
             <CardDescription>
              {user 
                ? "Beheer uw account en bekijk ons beleid."
                : "U bekijkt de app als gast."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user && (
              <>
                <Link href="/home/settings/profile" className="flex w-full items-center justify-between rounded-md p-3 hover:bg-secondary">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span>Profiel bewerken</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                <Separator className="my-2" />
                
                <Link href="/home/buurtbus-pas" className="flex w-full items-center justify-between rounded-md p-3 hover:bg-secondary">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <span>Buurtbus Pas</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                <Separator className="my-2" />
              </>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex w-full items-center justify-between rounded-md p-3 hover:bg-secondary">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span>Algemene Voorwaarden</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Algemene Voorwaarden</AlertDialogTitle>
                  <AlertDialogDescription className="max-h-[60vh] overflow-y-auto text-left">
                    <p className="mb-2">Laatst bijgewerkt: [Datum]</p>
                    <p className="mb-4">Welkom bij GGK. Lees deze voorwaarden zorgvuldig door voordat u onze service gebruikt.</p>
                    <h3 className="font-bold mb-2">1. Acceptatie van Voorwaarden</h3>
                    <p className="mb-4">Door gebruik te maken van de GGK app, gaat u akkoord met deze algemene voorwaarden. Als u niet akkoord gaat, dient u de app niet te gebruiken.</p>
                    <h3 className="font-bold mb-2">2. De Service</h3>
                    <p className="mb-4">GGK is een platform dat reizigers in contact brengt met vrijwillige chauffeurs. De service is afhankelijk van de beschikbaarheid van vrijwilligers en er kunnen geen garanties worden gegeven over de beschikbaarheid of wachttijden.</p>
                    <h3 className="font-bold mb-2">3. Gebruikersaccount</h3>
                    <p className="mb-4">U bent verantwoordelijk voor het geheimhouden van uw accountgegevens en voor alle activiteiten die onder uw account plaatsvinden. U dient ons onmiddellijk op de hoogte te stellen van elk ongeoorloofd gebruik van uw account.</p>
                    <h3 className="font-bold mb-2">4. Beperking van Aansprakelijkheid</h3>
                    <p className="mb-4">De service wordt geleverd "zoals deze is". Wij zijn niet aansprakelijk voor enige directe of indirecte schade die voortvloeit uit het gebruik van of de onmogelijkheid tot het gebruik van de service.</p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction>Sluiten</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Separator className="my-2" />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex w-full items-center justify-between rounded-md p-3 hover:bg-secondary">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <span>Privacybeleid (AVG)</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Privacybeleid (AVG)</AlertDialogTitle>
                  <AlertDialogDescription className="max-h-[60vh] overflow-y-auto text-left">
                    <p className="mb-2">Laatst bijgewerkt: [Datum]</p>
                    <p className="mb-4">Uw privacy is belangrijk voor ons. Dit beleid beschrijft welke gegevens we verzamelen en hoe we deze gebruiken.</p>
                    <h3 className="font-bold mb-2">1. Welke gegevens verzamelen we?</h3>
                    <p className="mb-4">Wij verzamelen uw naam, e-mailadres en locatiegegevens (alleen wanneer u een rit aanvraagt) om de service te kunnen leveren.</p>
                    <h3 className="font-bold mb-2">2. Hoe gebruiken we uw gegevens?</h3>
                    <p className="mb-4">Uw locatie wordt gedeeld met de chauffeur wanneer u een rit aanvraagt. Uw persoonlijke gegevens worden niet voor commerciële doeleinden gedeeld met derden.</p>
                    <h3 className="font-bold mb-2">3. Gegevensopslag</h3>
                    <p className="mb-4">Uw gegevens worden veilig opgeslagen in Firebase en worden beschermd door passende beveiligingsmaatregelen.</p>
                    <h3 className="font-bold mb-2">4. Uw rechten</h3>
                    <p className="mb-4">U heeft het recht om uw gegevens in te zien, te corrigeren of te verwijderen. Neem contact met ons op om van deze rechten gebruik te maken.</p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction>Sluiten</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Toegankelijkheid</CardTitle>
                <CardDescription>Pas de weergave van de app aan.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between rounded-md p-3">
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-muted-foreground" />
                    <span>Hoog Contrast Modus</span>
                  </div>
                  <Switch
                    checked={isHighContrast}
                    onCheckedChange={handleHighContrastToggle}
                    aria-label="Hoog Contrast Modus"
                  />
                </div>
                <Separator className="my-1" />
                <div className="flex items-center justify-between rounded-md p-3">
                  <div className="flex items-center gap-3">
                    <Type className="h-5 w-5 text-muted-foreground" />
                    <span>Grotere letters</span>
                  </div>
                  <Switch
                    checked={isLargeText}
                    onCheckedChange={handleLargeTextToggle}
                    aria-label="Grotere letters"
                  />
                </div>
            </CardContent>
        </Card>

        {user ? (
          <>
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

            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Uitloggen
            </Button>
          </>
        ) : (
           <Button variant="outline" className="w-full" asChild>
              <Link href="/">
                <LogIn className="mr-2 h-4 w-4" />
                Inloggen / Registreren
              </Link>
            </Button>
        )}
      </div>
    </div>
  );
}
