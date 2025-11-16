import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
const ContactPage = () => {
  const {
    toast
  } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: ""
  });
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      console.log("Envoi du formulaire avec les données:", formData);
      
      // Enregistrer directement dans la base de données
      const { data, error } = await supabase
        .from('contacts')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: formData.service || 'Demande de contact',
            message: formData.message
          }
        ])
        .select();
      
      if (error) {
        console.error("Erreur lors de l'enregistrement:", error);
        throw error;
      }
      
      console.log("Message enregistré:", data);
      
      toast({
        title: "Message envoyé ! ✅",
        description: "Nous avons bien reçu votre demande. Nous vous répondrons dans les plus brefs délais."
      });

      // Réinitialiser le formulaire
      setFormData({
        name: "",
        email: "",
        phone: "",
        service: "",
        message: ""
      });
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error("Erreur complète:", error);
      toast({
        title: "Erreur lors de l'envoi",
        description: error.message || "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleWhatsApp = () => {
    const phoneNumber = "33123456789";
    const message = encodeURIComponent("Bonjour, je souhaite obtenir un devis pour vos services.");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };
  const handleEmail = () => {
    window.location.href = "mailto:contact@novytek.fr?subject=Demande de devis";
  };
  return <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <section className="py-12 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contactez-nous</h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Une question ? Un projet ? N'hésitez pas à nous contacter
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div>
            <h2 className="text-3xl font-bold mb-6">Demande de devis</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Nom complet *</Label>
                <Input id="name" name="name" value={formData.name} onChange={e => handleInputChange("name", e.target.value)} required placeholder="Jean Dupont" className="mt-1.5" />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={e => handleInputChange("email", e.target.value)} required placeholder="jean.dupont@example.com" className="mt-1.5" />
              </div>

              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={e => handleInputChange("phone", e.target.value)} required placeholder="01 23 45 67 89" className="mt-1.5" />
              </div>

              <div>
                <Label htmlFor="service">Type de service *</Label>
                <Select name="service" required value={formData.service} onValueChange={value => handleInputChange("service", value)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Sélectionnez un service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Montage PC">Montage PC</SelectItem>
                    <SelectItem value="Optimisation système">Optimisation système</SelectItem>
                    <SelectItem value="Réinstallation Windows">Réinstallation Windows</SelectItem>
                    <SelectItem value="Installation réseau">Installation réseau</SelectItem>
                    <SelectItem value="Installation TV/Audio">Installation TV/Audio</SelectItem>
                    <SelectItem value="Domotique">Domotique</SelectItem>
                    <SelectItem value="Setup gaming">Setup gaming</SelectItem>
                    <SelectItem value="Conseil d'achat">Conseil d'achat</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea id="message" name="message" value={formData.message} onChange={e => handleInputChange("message", e.target.value)} required placeholder="Décrivez votre besoin..." className="mt-1.5 min-h-[120px]" />
              </div>

              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full shadow-primary">
                {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-6">Autres moyens de contact</h2>
              <div className="space-y-4">
                <Button onClick={handleWhatsApp} variant="outline" size="lg" className="w-full justify-start gap-3">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  <span>WhatsApp : 06 67 62 32 92  </span>
                </Button>

                <Button onClick={handleEmail} variant="outline" size="lg" className="w-full justify-start gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>nahmematthieu@gmail.com</span>
                </Button>

                <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Téléphone</p>
                    <a href="tel:+33123456789" className="text-muted-foreground hover:text-primary">
                      06 67 62 32 92                        
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-card">
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Zone d'intervention</h3>
                  <p className="text-muted-foreground">Montpellier et ses environs         </p>
                </div>
              </div>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Carte Google Maps</p>
              </div>
            </div>

            <div className="bg-primary/10 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">Horaires</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Lundi - Vendredi</span>
                  <span className="font-medium">9h - 19h</span>
                </div>
                <div className="flex justify-between">
                  <span>Samedi</span>
                  <span className="font-medium">10h - 18h</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimanche</span>
                  <span className="font-medium">Sur rendez-vous</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default ContactPage;