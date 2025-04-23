import React from 'react';
import { Instagram, Facebook, Twitter, MapPin } from 'lucide-react';

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    icon: Instagram,
    url: 'https://instagram.com/afrojerk',
    color: 'hover:bg-gradient-to-tr from-purple-600 via-pink-600 to-yellow-500'
  },
  {
    name: 'Facebook',
    icon: Facebook,
    url: 'https://facebook.com/afrojerk',
    color: 'hover:bg-[#1877f2]'
  },
  {
    name: 'Twitter',
    icon: Twitter,
    url: 'https://twitter.com/afrojerk',
    color: 'hover:bg-[#1da1f2]'
  }
];

export default function SocialLinks() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Connect With Us</h2>
              <p className="text-gray-600 mb-6">
                Follow us on social media for daily updates, behind-the-scenes content, 
                and to be the first to know where we'll be serving next!
              </p>
              
              <div className="flex gap-4 mb-8">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center
                      text-gray-600 hover:text-white ${social.color} transition-colors
                    `}
                    aria-label={social.name}
                  >
                    <social.icon className="w-6 h-6" />
                  </a>
                ))}
              </div>

              <a
                href="https://g.page/afrojerk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#eb1924] font-medium hover:text-[#eb1924]/80 transition-colors"
              >
                <MapPin className="w-5 h-5" />
                Find us on Google Maps
              </a>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold mb-4">Latest Reviews</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="text-yellow-400">★★★★★</div>
                  <p className="text-gray-600">
                    "Amazing fusion of flavors! The jerk chicken is a must-try!"
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="text-yellow-400">★★★★★</div>
                  <p className="text-gray-600">
                    "Best food truck in Charlotte! Love the West African influences."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}