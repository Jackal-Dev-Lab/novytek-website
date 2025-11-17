import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Services = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 useEffect appelé');
    
    const loadServices = async () => {
      console.log('📡 Chargement des services...');
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .limit(10);

        console.log('✅ Services chargés:', data?.length);
        
        if (data) {
          setServices(data);
        }
      } catch (error) {
        console.error('❌ Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []); // ⚠️ VIDE = une seule fois

  console.log('🎨 Render - Nombre de services:', services.length, 'Loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Nos Services</h1>
        <p className="mb-8">Nombre de services : {services.length}</p>
        
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <CardTitle>{service.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{service.short_description}</p>
                <p className="font-bold mb-4">
                  {service.price_min}€ - {service.price_max}€
                </p>
                <Link to="/contact">
                  <Button className="w-full">Devis</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
