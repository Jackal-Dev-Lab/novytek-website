import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ServiceCard from "@/components/ServiceCard";
import {
  Cpu,
  Settings,
  Wifi,
  Tv,
  Home,
  Gamepad2,
  HardDrive,
  ShoppingCart,
} from "lucide-react";

const ServicesPage = () => {
  const services = [
    {
      icon: Cpu,
      title: "Montage PC sur mesure",
      description:
        "Configuration et assemblage de PC personnalisé selon vos besoins : bureautique, gaming, création de contenu. Installation de tous les composants, câblage propre, tests de stabilité et optimisation.",
      price: "80€",
    },
    {
      icon: Settings,
      title: "Optimisation & Nettoyage",
      description:
        "Nettoyage complet du système (logiciels inutiles, virus, fichiers temporaires), défragmentation, optimisation du démarrage, mise à jour des pilotes, amélioration des performances.",
      price: "60€",
    },
    {
      icon: HardDrive,
      title: "Réinstallation Windows",
      description:
        "Formatage complet, réinstallation propre de Windows (10/11), installation des pilotes, configuration initiale, transfert de données, installation des logiciels essentiels.",
      price: "70€",
    },
    {
      icon: Wifi,
      title: "Installation Box & WiFi",
      description:
        "Installation et configuration de box internet, optimisation du réseau WiFi, installation de répéteurs ou système Mesh pour une couverture optimale, sécurisation du réseau.",
      price: "70€",
    },
    {
      icon: Tv,
      title: "Installation TV murale",
      description:
        "Fixation murale sécurisée de téléviseur (tous types de murs), câblage discret, installation et configuration de barre de son, connexion aux appareils (console, box, etc.).",
      price: "90€",
    },
    {
      icon: Home,
      title: "Domotique simple",
      description:
        "Installation et configuration d'ampoules connectées (Philips Hue, etc.), prises intelligentes, assistants vocaux (Alexa, Google Home), création de routines et automatisations.",
      price: "50€",
    },
    {
      icon: Gamepad2,
      title: "Setup Gaming optimisé",
      description:
        "Optimisation complète pour le gaming : réglages Windows, configuration GPU/CPU, overclocking sécurisé, optimisation réseau, installation de périphériques, tests de performance.",
      price: "100€",
    },
    {
      icon: ShoppingCart,
      title: "Conseil d'achat",
      description:
        "Accompagnement personnalisé pour l'achat de matériel informatique : analyse de vos besoins, recommandations de produits adaptés à votre budget, comparaison et aide à la commande.",
      price: "40€",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Header */}
      <section className="py-12 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nos Services</h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Des prestations techniques complètes pour tous vos besoins informatiques
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Informations pratiques</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-card">
                <h3 className="text-xl font-semibold mb-4">Tarifs</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Les prix indiqués sont à partir de et peuvent varier selon la complexité</li>
                  <li>• Devis gratuit et sans engagement</li>
                  <li>• Paiement après intervention</li>
                  <li>• Possibilité de forfaits pour plusieurs services</li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-card">
                <h3 className="text-xl font-semibold mb-4">Zone d'intervention</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Paris et toute l'Île-de-France</li>
                  <li>• Intervention sous 48h en moyenne</li>
                  <li>• Déplacement inclus dans les tarifs</li>
                  <li>• Disponible également le week-end</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Besoin d'un service ?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Contactez-nous pour obtenir un devis gratuit et personnalisé
          </p>
          <Button asChild size="lg" className="shadow-primary">
            <Link to="/contact">Demander un devis</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
