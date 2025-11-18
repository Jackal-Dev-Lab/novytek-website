import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Brain, Globe, Gamepad2, Code, Laptop, Briefcase } from "lucide-react";

const MOCK_SERVICES = [
  {
    id: '1',
    name: 'Site vitrine professionnel',
    short_description: 'Site web moderne et responsive',
    price_min: 499,
    price_max: 1499,
    category: 'web',
    icon: Globe
  },
  {
    id: '2',
    name: 'Formation IA Génératives',
    short_description: 'Maîtrisez ChatGPT, Claude, Midjourney',
    price_min: 149,
    price_max: 299,
    category: 'ia',
    icon: Brain
  },
  {
    id: '3',
    name: 'Script FiveM sur mesure',
    short_description: 'Scripts professionnels ESX/QBCore',
    price_min: 299,
    price_max: 1999,
    category: 'gaming',
    icon: Gamepad2
  },
  {
    id: '4',
    name: 'Script Python personnalisé',
    short_description: 'Automatisation et outils Python',
    price_min: 149,
    price_max: 999,
    category: 'software',
    icon: Code
  },
  {
    id: '5',
    name: 'Dépannage informatique',
    short_description: 'Dépannage PC, Mac, téléphone',
    price_min: 49,
    price_max: 99,
    category: 'informatique',
    icon: Laptop
  },
  {
    id: '6',
    name: 'Pack Digital Entrepreneur',
    short_description: 'Site + Email + Outils IA',
    price_min: 999,
    price_max: 1999,
    category: 'business',
    icon: Briefcase
  }
];

const Services = () => {
  const [services] = useState(MOCK_SERVICES);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Nos Services</h1>
          <p className="text-xl text-gray-600">
            De l'IA à l'informatique, trouvez le service parfait
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{service.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{service.short_description}</p>
                  <p className="text-xl font-bold text-primary mb-4">
                    {service.price_min}€ - {service.price_max}€
                  </p>
                  <Link to="/contact">
                    <Button className="w-full">Demander un devis</Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center bg-primary/5 py-12 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Plus de 50 services disponibles</h2>
          <p className="text-gray-600 mb-6">Contactez-nous pour découvrir tous nos services</p>
          <Link to="/contact">
            <Button size="lg">Voir tous les services</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Services;
