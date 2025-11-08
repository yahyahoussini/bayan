import { Leaf, Heart, Award, Sparkles, Star, Shield, Droplets, Flower2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();

  const values = [
    {
      icon: Leaf,
      title: "100% Naturel",
      description: "Tous nos produits sont formulés avec des ingrédients naturels soigneusement sélectionnés, sans produits chimiques nocifs.",
      color: "from-emerald-500 to-green-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600"
    },
    {
      icon: Sparkles,
      title: "Ingrédients Locaux",
      description: "Nous utilisons des ingrédients marocains authentiques comme le luban dakar et l'huile d'argan, directement issus de nos terres.",
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600"
    },
    {
      icon: Award,
      title: "Certifié Bio",
      description: "Nos produits sont certifiés biologiques et respectent les normes les plus strictes de qualité et de traçabilité.",
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      icon: Heart,
      title: "Fait avec Amour",
      description: "Chaque produit est créé avec soin et passion pour votre bien-être, en respectant les traditions ancestrales.",
      color: "from-pink-500 to-rose-600",
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600"
    }
  ];

  const benefits = [
    "Propriétés anti-inflammatoires et apaisantes",
    "Aide à uniformiser le teint et réduire les taches",
    "Effet rajeunissant et régénérant",
    "Protection naturelle contre les agressions extérieures"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card to-background">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-2xl"></div>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Notre Histoire</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              À Propos de
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Bayan Cosmetic
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Beauté naturelle marocaine depuis 2024
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-xl"></div>
              <Card className="relative bg-gradient-to-br from-card to-background border-2 border-primary/20 shadow-2xl">
                <CardContent className="p-8 md:p-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold">Notre Histoire</h2>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    Bayan Cosmetic est née d'une passion pour la beauté naturelle et les traditions marocaines.
                    Inspirés par les secrets de beauté transmis de génération en génération, nous avons créé
                    une gamme de produits cosmétiques alliant authenticité et efficacité moderne.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Chaque produit raconte une histoire, celle d'un savoir-faire ancestral qui rencontre
                    l'innovation d'aujourd'hui pour vous offrir le meilleur de la nature marocaine.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded-3xl blur-xl"></div>
              <Card className="relative bg-gradient-to-br from-background to-card border-2 border-accent/20 shadow-2xl">
                <CardContent className="p-8 md:p-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold">Notre Mission</h2>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    Offrir des produits de beauté 100% naturels, fabriqués à partir d'ingrédients marocains
                    de qualité supérieure. Nous croyons que la beauté doit être accessible, naturelle et
                    respectueuse de votre peau et de l'environnement.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Notre engagement va au-delà de la qualité : nous nous efforçons de préserver les traditions
                    tout en innovant pour répondre aux besoins modernes de votre peau.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-card/50 to-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Nos Valeurs</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Les principes qui guident chaque décision et chaque produit que nous créons
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card 
                  key={index}
                  className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <CardContent className="p-6 relative z-10">
                    <div className={`w-16 h-16 ${value.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-8 h-8 ${value.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Luban Dakar Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-2xl"></div>
              <Card className="relative bg-gradient-to-br from-card to-background border-2 border-primary/30 shadow-2xl">
                <CardContent className="p-8 md:p-12">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
                      <Droplets className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold">Le Luban Dakar</h2>
                      <p className="text-sm text-muted-foreground mt-1">Ingrédient ancestral</p>
                    </div>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    Le luban dakar, également connu sous le nom d'encens, est un ingrédient précieux utilisé
                    depuis des siècles dans les rituels de beauté marocains. Cette résine naturelle possède
                    des propriétés extraordinaires pour la peau.
                  </p>
                  <div className="space-y-4">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Star className="w-3 h-3 text-white fill-white" />
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{benefit}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold">Qualité Garantie</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Tous nos produits sont testés et certifiés pour garantir leur efficacité et leur sécurité.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-2 border-accent/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Flower2 className="w-6 h-6 text-accent" />
                    <h3 className="text-xl font-bold">Tradition & Innovation</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Nous combinons les savoir-faire ancestraux avec les dernières innovations en cosmétique naturelle.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500/10 to-green-600/10 border-2 border-emerald-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Leaf className="w-6 h-6 text-emerald-600" />
                    <h3 className="text-xl font-bold">Respect de l'Environnement</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Nos produits sont conçus dans le respect de l'environnement, avec des emballages recyclables.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Découvrez Notre Collection
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explorez nos produits naturels et transformez votre routine beauté avec l'authenticité marocaine.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/boutique')}
            className="bg-gradient-to-r from-primary to-accent text-white hover:from-accent hover:to-primary transition-all duration-300 px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl"
          >
            Voir la Boutique
          </Button>
        </div>
      </section>
    </div>
  );
}
