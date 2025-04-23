export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  dietary: {
    vegetarian?: boolean;
    spicy?: boolean;
    glutenFree?: boolean;
  };
  category: 'mains' | 'sides' | 'drinks' | 'desserts';
}

export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  hours: {
    open: string;
    close: string;
  };
  image_url: string;
}

export interface ScheduleEvent {
  id: string;
  locationId: string;
  date: string;
  startTime: string;
  endTime: string;
}