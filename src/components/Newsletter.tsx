import React, { useState } from 'react';
import { Mail, X } from 'lucide-react';

export default function Newsletter() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="bg-[#edba3a]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-[#edba3a]" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Stay Updated!</h3>
          <p className="text-gray-600">
            Get exclusive offers and be the first to know our location updates!
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 mb-4"
            required
          />
          
          <button 
            type="submit"
            className="w-full bg-[#edba3a] text-white py-3 rounded-lg hover:bg-[#edba3a]/90 transition-colors"
          >
            Subscribe Now
          </button>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
          </p>
        </form>
      </div>
    </div>
  );
}