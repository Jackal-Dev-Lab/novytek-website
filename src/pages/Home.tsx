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
  CheckCircle2,
  MapPin,
  Clock,
  Shield,
} from "lucide-react";

const HomePage = () => {
  const mainServices = [
    {
      icon: Cpu,
      title: "Montage PC",
      description: "Configuration et assemblage sur mesure selon vos besoins",
      price: "80€",
    },
    {
      icon: Settings,
      title: "Optimisation",
      description: "Nettoyage, formatage et réinstallation Windows",
      price: "60€",
    },
    {
      icon: Wifi,
      title: "Installation Réseau",
      description: "Box internet, WiFi, répéteurs et système Mesh",
      price: "70€",
    },
    {
      icon: Home,
      title: "Domotique",
      description: "Installation d'ampoules, prises et assistants connectés",
      price: "50€",
    },
    {
      icon: Tv,
      title: "TV & Audio",
      description: "Fixation murale TV et installation barre de son",
      price: "90€",
    },
    {
      icon: Gamepad2,
      title: "Setup Gaming",
      description: "Optimisation complète de votre configuration gaming",
      price: "100€",
    },
  ];

  const advantages = [
    { icon: Clock, text: "Intervention rapide sous 48h" },
    { icon: Shield, text: "Garantie satisfaction" },
    { icon: MapPin, text: "Service à domicile" },
    { icon: CheckCircle2, text: "Tarifs transparents" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              Services Tech à Domicile
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Rapides • Fiables • Abordables
            </p>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Profitez d'une expertise technique professionnelle pour tous vos besoins informatiques et technologiques, directement chez vous.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="shadow-primary text-lg">
                <Link to="/contact">Demander un devis gratuit</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/services">Voir les services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nos Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Des solutions techniques complètes pour particuliers et professionnels
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {mainServices.map((service, index) => (
              <div key={index} style={{ animationDelay: `${index * 100}ms` }}>
                <ServiceCard {...service} />
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild size="lg" variant="outline">
              <Link to="/services">Voir tous les services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pourquoi NovyTek ?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((advantage, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="mb-4 p-4 bg-primary/10 rounded-full">
                  <advantage.icon className="h-8 w-8 text-primary" />
                </div>
                <p className="font-medium">{advantage.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comment ça marche ?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Contact", desc: "Contactez-nous par téléphone, email ou WhatsApp" },
              { step: "2", title: "Devis", desc: "Recevez un devis gratuit et transparent" },
              { step: "3", title: "Intervention", desc: "Nous intervenons rapidement à votre domicile" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center bg-gradient-hero text-white rounded-2xl p-12 shadow-primary">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à améliorer votre expérience tech ?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Contactez-nous dès maintenant pour un devis gratuit et sans engagement
            </p>
            <Button asChild size="lg" variant="secondary" className="shadow-lg">
              <Link to="/contact">Demander un devis</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
