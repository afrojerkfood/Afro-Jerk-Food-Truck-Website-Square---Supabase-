import React from 'react';
import { Truck } from 'lucide-react';

export default function FoodTruck() {
  return (
    <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none">
      <div className="animate-truck">
        <div className="flex items-center gap-3 text-white/80">
        <div className="w-4 h-4 rounded-full bg-white/10" />
        <div className="w-5 h-5 rounded-full bg-white/15" />
        <div className="w-6 h-6 rounded-full bg-white/20" />
        {/* <Truck className="w-16 h-16" />
 */}
          <img 
          src="https://cnkalkntbjisvbpjtojk.supabase.co/storage/v1/object/public/media//truckAsset%201.svg"
          alt="Food Truck"
          className="w-32 h-20"
        />
        </div>
      </div>
    </div>
  );
}