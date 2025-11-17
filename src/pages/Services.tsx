import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Services = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 useEffect DÉBUT');
    
    const loadServices = async () => {
      console.log('📡 Tentative de chargement...');
      
      try {
        console.log('⏳ Avant requête Supabase');
        
        const { data, error } = await supabase
          .from('services')
          .select('id, name, short_description, price_min, price_max')
          .eq('is_active', true)
          .limit(10);

        console.log('✅ Après requête - Data:', data);
        console.log('❌ Erreur éventuelle:', error);
        
        if (error) {
          console.error('🚨 ERREUR SUPABASE:', error);
          setError(error.message);
        }
        
        if (data) {
          console.log('💾 Mise à jour state avec', data.length, 'services');
          setServices(data);
        }
        
      } catch (err: any) {
        console.error('💥 ERREUR CATCH:', err);
        setError(err.message);
      } finally {
        console.log('🏁 FINALLY - setLoading(false)');
        setLoading(false);
      }
    };

    loadServices();
    
    console.log('✅ useEffect FIN');
  }, []);

  console.log('🎨 RENDER - Loading:', loading, 'Services:', services.length, 'Error:', error);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des services...</p>
          <p className="text-xs text-gray-500 mt-2">Si ça reste bloqué, vérifier la console</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-bold mb-2">Erreur de chargement</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Nos Services</h1>
        
        {services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">Aucun service disponible</p>
            <p className="text-sm text-gray-500">
              Exécutez le script SQL pour créer les services
            </p>
          </div>
        ) : (
          <>
            <p className="mb-8 text-gray-600">{services.length} services disponibles</p>
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
                      <Button className="w-full">Demander un devis</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Services;
