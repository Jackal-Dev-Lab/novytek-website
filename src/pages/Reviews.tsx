import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ReviewsPage = () => {
  const reviews = [
    {
      name: "Marie L.",
      date: "Il y a 2 semaines",
      rating: 5,
      comment:
        "Service impeccable ! Mon PC rame moins et démarre beaucoup plus vite. Intervention rapide et explications claires. Je recommande vivement.",
    },
    {
      name: "Thomas B.",
      date: "Il y a 1 mois",
      rating: 5,
      comment:
        "Très satisfait du montage de mon PC gaming. Configuration parfaite selon mon budget, tout fonctionne à merveille. Professionnel et à l'écoute.",
    },
    {
      name: "Sophie D.",
      date: "Il y a 1 mois",
      rating: 5,
      comment:
        "Installation de ma box et du WiFi dans toute la maison. Plus aucune zone morte ! Travail soigné et tarif correct. Merci !",
    },
    {
      name: "Pierre M.",
      date: "Il y a 2 mois",
      rating: 5,
      comment:
        "Mon setup gaming a été optimisé de A à Z. Les performances ont vraiment augmenté. Service pro et rapide.",
    },
    {
      name: "Isabelle R.",
      date: "Il y a 2 mois",
      rating: 5,
      comment:
        "Installation de ma TV murale et barre de son. Rendu parfait, câbles invisibles. Je suis ravie du résultat !",
    },
    {
      name: "Alexandre K.",
      date: "Il y a 3 mois",
      rating: 5,
      comment:
        "Réinstallation complète de Windows et optimisation. Mon ordinateur fonctionne comme neuf. Excellent service !",
    },
  ];

  const averageRating = 5;
  const totalReviews = reviews.length;

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <section className="py-12 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Avis Clients</h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Découvrez ce que nos clients pensent de nos services
          </p>
        </div>
      </section>

      {/* Rating Summary */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card p-8 rounded-2xl shadow-card text-center">
              <div className="mb-4">
                <div className="text-5xl font-bold text-primary mb-2">{averageRating.toFixed(1)}</div>
                <div className="flex justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-6 w-6 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground">
                  Basé sur {totalReviews} avis clients
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews List */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <Card key={index} className="hover:shadow-primary transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{review.name}</h3>
                        <p className="text-sm text-muted-foreground">{review.date}</p>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-primary text-primary"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Rejoignez nos clients satisfaits</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Bénéficiez vous aussi d'un service de qualité
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 shadow-primary"
            >
              Demander un devis
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReviewsPage;
