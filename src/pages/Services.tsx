import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Monitor, Globe, Gamepad2, Code, Laptop, 
  Briefcase, Brain, Phone, MessageSquare, ArrowRight,
  Check, Star, Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";

const iconMap: any = {
  Brain: Brain,
  Globe: Globe,
  Gamepad2: Gamepad2,
  Code: Code,
  Laptop: Laptop,
  Briefcase: Briefcase,
};

interface Service {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  price_min: number;
  price_max: number;
  price_label: string;
  duration: string;
  difficulty: string;
  includes: string[];
  is_popular: boolean;
  is_featured: boolean;
  badge: string | null;
  category_name: string;
  category_slug: string;
  icon: string;
}

const Services = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: categoriesData } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      const { data: servicesData } = await supabase
        .from('services_by_category')
        .select('*');

      if (categoriesData) setCategories(categoriesData);
      if (servicesData) {
        setServices(servicesData);
        setFilteredServices(servicesData);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = services;
    if (selectedCategory !== "all") {
      filtered = filtered.filter(s => s.category_slug === selectedCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.short_description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredServices(filtered);
  }, [selectedCategory, searchQuery, services]);

  const formatPrice = (service: Service) => {
    if (!service.price_min) return "Sur devis";
    if (service.price_min === service.price_max) return `${service.price_min}€`;
    return `${service.price_min}€ - ${service.price_max}€`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const featuredServices = services.filter(s => s.is_featured);

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 to-blue-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              50+ Services
            </Badge>
            <h1 className="text-5xl font-bold mb-6">Nos Services</h1>
            <p className="text-xl text-gray-600 mb-8">
              De l'IA à l'informatique. Trouvez le service parfait pour vous.
            </p>
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services en vedette */}
      {featuredServices.length > 0 && !searchQuery && selectedCategory === "all" && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              <Star className="inline h-8 w-8 text-yellow-500 mr-2" />
              Services populaires
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredServices.map((service) => {
                const Icon = iconMap[service.icon] || Monitor;
                return (
                  <Card key={service.id} className="border-2 border-primary/20">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        {service.badge && <Badge>{service.badge}</Badge>}
                      </div>
                      <CardTitle>{service.name}</CardTitle>
                      <CardDescription>{service.category_name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-gray-600">{service.short_description}</p>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Prix</span>
                          <span className="font-bold text-primary">{formatPrice(service)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Durée</span>
                          <span>{service.duration}</span>
                        </div>
                      </div>
                      <Link to="/contact">
                        <Button className="w-full">
                          Demander un devis
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Tous les services */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="mb-8">
              <TabsTrigger value="all">Tous</TabsTrigger>
              {categories.map((cat) => {
                const Icon = iconMap[cat.icon] || Monitor;
                return (
                  <TabsTrigger key={cat.id} value={cat.slug}>
                    <Icon className="h-4 w-4 mr-2" />
                    {cat.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="mb-4">{filteredServices.length} services</div>

            <div className="grid md:grid-cols-3 gap-6">
              {filteredServices.map((service) => {
                const Icon = iconMap[service.icon] || Monitor;
                return (
                  <Card key={service.id}>
                    <CardHeader>
                      <div className="flex justify-between">
                        <Icon className="h-6 w-6 text-primary" />
                        {service.badge && <Badge variant="secondary">{service.badge}</Badge>}
                      </div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription>{service.category_name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">{service.short_description}</p>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>Prix</span>
                          <span className="font-semibold">{formatPrice(service)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Durée</span>
                          <span>{service.duration}</span>
                        </div>
                      </div>
                      {service.includes?.slice(0, 2).map((item, i) => (
                        <div key={i} className="flex items-start text-xs mb-1">
                          <Check className="h-3 w-3 text-green-600 mr-1 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                      <Link to="/contact">
                        <Button className="w-full mt-4" variant="outline">Devis</Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </Tabs>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Service personnalisé ?</h2>
          <p className="text-xl mb-8">Contactez-nous pour un devis sur mesure</p>
          <div className="flex gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" variant="secondary">
                <MessageSquare className="mr-2 h-5 w-5" />
                Demander un devis
              </Button>
            </Link>
            <a href="https://wa.me/33667623292">
              <Button size="lg" variant="outline" className="bg-transparent">
                <Phone className="mr-2 h-5 w-5" />
                WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
