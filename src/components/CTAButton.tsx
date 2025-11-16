import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const CTAButton = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = "33123456789"; // Format international sans le +
    const message = encodeURIComponent("Bonjour, je souhaite obtenir un devis pour vos services.");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 md:hidden">
      <Button
        size="lg"
        onClick={handleWhatsAppClick}
        className="rounded-full h-14 w-14 shadow-primary hover:scale-110 transition-transform"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default CTAButton;
