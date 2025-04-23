import React from 'react';
import { Utensils, Heart, Users } from 'lucide-react';

const HIGHLIGHTS = [
  {
    icon: Utensils,
    title: 'Fusion Cuisine',
    description: 'We blend African and Caribbean flavors to create unique, mouthwatering dishes that tell our story.'
  },
  {
    icon: Heart,
    title: 'Made with Love',
    description: 'Every dish is crafted with passion, using authentic spices and fresh, quality ingredients.'
  },
  {
    icon: Users,
    title: 'Community First',
    description: "More than food, we're building a community that celebrates diversity through culinary experiences."
  }
];

export default function About() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Our Story</h2>
          <p className="text-gray-600 text-lg">
            Born from a passion for sharing authentic flavors, Afro Jerk brings together 
            the vibrant tastes of Africa and the Caribbean to the streets of Charlotte. 
            Our journey began with a simple dream: to create a unique culinary experience 
            that bridges cultures and brings communities together.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {HIGHLIGHTS.map((highlight) => (
            <div 
              key={highlight.title}
              className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="w-16 h-16 bg-[#eb1924]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <highlight.icon className="w-8 h-8 text-[#eb1924]" />
              </div>
              <h3 className="text-xl font-bold mb-2">{highlight.title}</h3>
              <p className="text-gray-600">{highlight.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}