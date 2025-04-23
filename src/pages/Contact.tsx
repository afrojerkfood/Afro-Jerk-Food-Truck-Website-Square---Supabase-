import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, Instagram, Facebook, Twitter } from 'lucide-react';

const CONTACT_INFO = {
  phone: '+1 (803) 999-7978',
  email: 'afrojerkfood@gmail.com',
  social: {
    instagram: 'https://instagram.com/afrojerk',
    facebook: 'https://facebook.com/afrojerk',
    twitter: 'https://twitter.com/afrojerk'
  },
  locations: [
    {
      name: 'Charlotte Uptown',
      address: '101 N Tryon St, Charlotte, NC',
      hours: '11:00 AM - 8:00 PM'
    },
    {
      name: 'Rock Hill',
      address: '122 Main St, Rock Hill, SC',
      hours: '11:00 AM - 8:00 PM'
    }
  ]
};

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitStatus('success');
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <div className="bg-[#edba3a] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-white/90 max-w-2xl mx-auto">
            Have questions or feedback? We'd love to hear from you!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
            
            <div className="space-y-6">
              {/* Direct Contact */}
              <div className="space-y-4">
                <a 
                  href={`tel:${CONTACT_INFO.phone}`}
                  className="flex items-center gap-3 text-gray-600 hover:text-[#edba3a] transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span>{CONTACT_INFO.phone}</span>
                </a>
                
                <a 
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="flex items-center gap-3 text-gray-600 hover:text-[#edba3a] transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>{CONTACT_INFO.email}</span>
                </a>
              </div>

              {/* Locations */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Our Locations</h3>
                {CONTACT_INFO.locations.map((location) => (
                  <div 
                    key={location.name}
                    className="flex items-start gap-3 text-gray-600"
                  >
                    <MapPin className="w-5 h-5 mt-1" />
                    <div>
                      <p className="font-medium">{location.name}</p>
                      <p className="text-sm">{location.address}</p>
                      <p className="text-sm text-gray-500">{location.hours}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-lg font-medium mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  <a 
                    href={CONTACT_INFO.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#edba3a] hover:text-white transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a 
                    href={CONTACT_INFO.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#edba3a] hover:text-white transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a 
                    href={CONTACT_INFO.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#edba3a] hover:text-white transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#edba3a] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#edba3a] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#edba3a] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#edba3a] focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white
                  ${isSubmitting ? 'bg-gray-400' : 'bg-[#edba3a] hover:bg-[#edba3a]/90'}
                  transition-colors
                `}
              >
                <Send className="w-5 h-5" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>

              {submitStatus === 'success' && (
                <p className="text-[#01a952] text-center">
                  Thank you! We'll get back to you soon.
                </p>
              )}

              {submitStatus === 'error' && (
                <p className="text-[#eb1924] text-center">
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}