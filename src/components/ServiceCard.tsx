import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  price?: string;
}

const ServiceCard = ({ icon: Icon, title, description, price }: ServiceCardProps) => {
  return (
    <Card className="group hover:shadow-primary transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border/50">
      <CardHeader>
        <div className="mb-4 inline-flex p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      {price && (
        <CardContent>
          <p className="text-2xl font-bold text-primary">{price}</p>
          <p className="text-sm text-muted-foreground">à partir de</p>
        </CardContent>
      )}
    </Card>
  );
};

export default ServiceCard;
