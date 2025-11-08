import { Star } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';

const TESTIMONIALS = [
  {
    id: "testimonial-1",
    name: "Fatima Z.",
    profession: "Cliente",
    rating: 5,
    description:
      "Une transformation incroyable de ma peau ! Les produits sont vraiment naturels et efficaces.",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "testimonial-2",
    name: "Amina M.",
    profession: "Cliente",
    rating: 5,
    description:
      "J'adore la crème hydratante ! Ma peau n'a jamais été aussi douce et éclatante.",
    avatarUrl:
      "https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    id: "testimonial-3",
    name: "Khadija R.",
    profession: "Cliente",
    rating: 5,
    description:
      "Le sérum au luban dakar a donné une nouvelle vie à ma peau. Résultats visibles dès la première semaine !",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHByb2ZpbGV8ZW58MHx8MHx8fDA%3D",
  },
  {
    id: "testimonial-4",
    name: "Salma H.",
    profession: "Cliente",
    rating: 5,
    description:
      "Produits exceptionnels ! Ma routine beauté n'est plus la même. Je recommande vivement à toutes mes amies.",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDN8fHxlbnwwfHx8fHw%3D",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-[#faf9f7] via-card to-card relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="mb-12">
          <h2 className="text-center text-4xl font-bold mb-4">Ce Que Nos Clientes Disent</h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-muted-foreground">
            Découvrez les témoignages authentiques de nos clientes satisfaites
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((testimonial) => (
            <Card key={testimonial.id} className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.description}"</p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={testimonial.avatarUrl}
                      alt={`Portrait de ${testimonial.name}`}
                    />
                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.profession}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
