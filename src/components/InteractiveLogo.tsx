import React, { useState } from 'react';

const FLAGS = [
  { country: 'Liberia', flag: 'https://flagcdn.com/w160/lr.png', position: { top: '-1%', left: '30%' }},
  {  country: 'Jamaica', flag: 'https://flagcdn.com/w160/jm.png', position: { top: '-1%', right: '30%' }},
  
  { country: 'Haiti', flag: 'https://flagcdn.com/w160/ht.png', position: { top: '8.5%', left: '13%' } },
  { country: 'Barbados', flag: 'https://flagcdn.com/w160/bb.png', position: { top: '8.5%', right: '13%' } },

  { country: 'South Africa', flag: 'https://flagcdn.com/w160/za.png', position: { top: '21%', left: '2%' } },
  { country: 'Grenada', flag: 'https://flagcdn.com/w160/gd.png', position: { top: '21%', right: '2%' } },
  
  { country: 'Antigua and Barbuda', flag: 'https://flagcdn.com/w160/ag.png', position: { top: '36%', left: '-5%' } },
  { country: 'Bahamas', flag: 'https://flagcdn.com/w160/bs.png', position: { top: '36%', right: '-5%' } },
  
  { country: 'Cuba', flag: 'https://flagcdn.com/w160/cu.png', position: { top: '50%', left: '-7%' } },
  { country: 'Dominica', flag: 'https://flagcdn.com/w160/dm.png', position: { top: '50%', right: '-7%' } },
  
  { country: 'Guyana', flag: 'https://flagcdn.com/w160/gy.png', position: { top: '62.5%', left: '-5%' } },  
  { country: 'Puerto Rico', flag: 'https://flagcdn.com/w160/pr.png', position: { top: '62.5%', right: '-5%' } },
 
  { country: 'Nigeria', flag: 'https://flagcdn.com/w160/ng.png', position: { top: '75%', left: '2%' } },
  { country: 'Ethiopia', flag: 'https://flagcdn.com/w160/et.png', position: { top: '75%', right: '2%' } },
 
  { country: 'Ghana', flag: 'https://flagcdn.com/w160/gh.png', position: { top: '87.5%', left: '13%' }},
  { country: 'Trinidad', flag: 'https://flagcdn.com/w160/tt.png', position: { top: '87.5%', right: '13%' }},
  
  { country: 'Saint Kitts and Nevis', flag: 'https://flagcdn.com/w160/kn.png', position: { top: '96%', left: '30%' } },
  { country: 'Saint Lucia', flag: 'https://flagcdn.com/w160/lc.png', position: { top: '96%', right: '30%' } }
];

export default function InteractiveLogo() {
  const [activeFlag, setActiveFlag] = useState<string | null>(null);

  return (
   <section className="py-16 relative overflow-hidden">
  {/* Background Pattern */}
  <div 
    className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"
    style={{
      backgroundImage: `radial-gradient(circle at 20px 20px, #e5e7eb 2px, transparent 0)`,
      backgroundSize: '40px 40px'
    }}
  />
  
  <div className="container mx-auto px-6 md:px-4 ">
    <div className="max-w-2xl mx-auto">
      <div className="relative aspect-square bg-white/50 backdrop-blur-sm rounded-full p-4 md:p-8 shadow-lg transition-all duration-300">
        <img 
          src="https://cnkalkntbjisvbpjtojk.supabase.co/storage/v1/object/public/media//afro%20jerk%20logo@0%20(1).5x"
          alt="Afro Jerk Logo"
          className="w-full h-full object-contain"
        />
        
        {/* Decorative Circles */}
        <div className="absolute inset-0 rounded-full border-2 md:border-4 border-dashed border-gray-100 animate-spin-slow md:block hidden" />
        
        {FLAGS.map((flag) => (
          <div
            key={flag.country}
            className="absolute"
            style={flag.position as React.CSSProperties}
          >
            <button
              onMouseEnter={() => setActiveFlag(flag.country)}
              onMouseLeave={() => setActiveFlag(null)}
              className="relative group"
            >
              <img
                src={flag.flag}
                alt={`${flag.country} Flag`}
                className="w-10 h-6 md:w-16 md:h-10 rounded-lg shadow-lg transition-transform group-hover:scale-110 ring-1 md:ring-2 ring-white"
              />
              {activeFlag === flag.country && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 bg-black/80 text-white text-xs md:text-sm rounded whitespace-nowrap z-50">
                  {flag.country}
                </div>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

  );
}