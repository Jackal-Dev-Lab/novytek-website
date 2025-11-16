import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Award, Clock, Heart, Target } from "lucide-react";

const AboutPage = () => {
  const values = [
    {
      icon: Target,
      title: "Expertise",
      description: "Des années d'expérience dans le domaine de l'informatique et des technologies",
    },
    {
      icon: Clock,
      title: "Réactivité",
      description: "Interventions rapides sous 48h pour répondre à vos urgences",
    },
    {
      icon: Heart,
      title: "Proximité",
      description: "Un service personnalisé et à l'écoute de vos besoins spécifiques",
    },
    {
      icon: Award,
      title: "Qualité",
      description: "Des prestations professionnelles avec garantie satisfaction",
    },
  ];

  const skills = [
    "Montage et configuration PC",
    "Dépannage système Windows",
    "Installation réseau & WiFi",
    "Domotique & objets connectés",
    "Setup gaming & overclocking",
    "Conseil matériel informatique",
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <section className="py-12 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">À propos de NovyTek</h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Votre expert tech de proximité en Île-de-France
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-3xl font-bold mb-6">Qui suis-je ?</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Passionné d'informatique depuis toujours, j'ai décidé de mettre mon expertise technique au service des particuliers et petites entreprises qui ont besoin d'une aide professionnelle sans les contraintes des grandes entreprises.
                  </p>
                  <p>
                    Avec plusieurs années d'expérience dans le dépannage informatique, l'installation de systèmes et la configuration de matériel, je propose aujourd'hui mes services pour vous accompagner dans tous vos projets tech.
                  </p>
                  <p>
                    Mon objectif : vous offrir un service rapide, fiable et abordable, avec des explications claires et des solutions adaptées à vos besoins réels.
                  </p>
                </div>
              </div>
              <div className="bg-muted rounded-2xl aspect-square flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Award className="h-24 w-24 mx-auto mb-4 text-primary" />
                  <p className="text-lg font-medium">Photo à venir</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Pourquoi me choisir ?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-card p-6 rounded-lg shadow-card">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Mes compétences</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="bg-card border border-border p-4 rounded-lg text-center hover:border-primary transition-colors"
                >
                  <p className="font-medium">{skill}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Travaillons ensemble</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            N'hésitez pas à me contacter pour discuter de votre projet tech
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="shadow-primary">
              <Link to="/contact">Me contacter</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/services">Voir les services</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
