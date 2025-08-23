export interface Destination {
  id: number;
  name: string;
  description: string;
  image: string;
  highlights: string[];
}

export interface Route {
  id: number;
  name: string;
  startCity: string;
  endCity: string;
  days: number;
  tags: string[];
  description: string;
}

export interface Spot {
  id: number;
  name: string;
  destination: string;
  description: string;
  image: string;
  category: string;
}

export interface ExploreData {
  destinations: Destination[];
  routes: Route[];
  spots: Spot[];
}

const destinations: Destination[] = [
  {
    id: 1,
    name: 'Beijing',
    description: 'Historic capital with ancient architecture and modern culture',
    image: '/placeholder.svg',
    highlights: ['Forbidden City', 'Great Wall', 'Temple of Heaven']
  },
  {
    id: 2,
    name: "Xi'an",
    description: 'Ancient capital famous for Terracotta Warriors',
    image: '/placeholder.svg',
    highlights: ['Terracotta Army', 'City Wall', 'Muslim Quarter']
  },
  {
    id: 3,
    name: 'Shanghai',
    description: 'Modern metropolis blending East and West',
    image: '/placeholder.svg',
    highlights: ['The Bund', 'Yu Garden', 'Oriental Pearl Tower']
  },
  {
    id: 4,
    name: 'Chengdu',
    description: 'Home of giant pandas and spicy Sichuan cuisine',
    image: '/placeholder.svg',
    highlights: ['Panda Base', 'Jinli Street', 'Wenshu Monastery']
  },
  {
    id: 5,
    name: 'Guilin',
    description: 'Famous for its karst landscape and picturesque Li River',
    image: '/placeholder.svg',
    highlights: ['Li River Cruise', 'Yangshuo', 'Reed Flute Cave']
  },
  {
    id: 6,
    name: 'Hangzhou',
    description: 'Known for the serene West Lake and lush tea plantations',
    image: '/placeholder.svg',
    highlights: ['West Lake', 'Lingyin Temple', 'Longjing Tea Fields']
  },
  {
    id: 7,
    name: 'Lhasa',
    description: 'Spiritual heart of Tibet with stunning monasteries',
    image: '/placeholder.svg',
    highlights: ['Potala Palace', 'Jokhang Temple', 'Barkhor Street']
  },
  {
    id: 8,
    name: 'Zhangjiajie',
    description: 'Avatar-like floating pillars in a vast national park',
    image: '/placeholder.svg',
    highlights: ['Tianzi Mountain', 'Bailong Elevator', 'Glass Bridge']
  },
  {
    id: 9,
    name: 'Huangshan',
    description: 'Iconic Yellow Mountains with granite peaks and hot springs',
    image: '/placeholder.svg',
    highlights: ['Greeting-Guests Pine', 'Begin-to-Believe Peak', 'Hot Springs']
  },
  {
    id: 10,
    name: 'Suzhou',
    description: 'City of canals, classical gardens, and silk production',
    image: '/placeholder.svg',
    highlights: ['Humble Administrator\'s Garden', 'Tiger Hill', 'Canal Cruise']
  }
];

const routes: Route[] = [
  {
    id: 1,
    name: 'Classic China Discovery',
    startCity: 'Beijing',
    endCity: 'Shanghai',
    days: 7,
    tags: ['7-day', 'Cultural', 'Historic'],
    description: "Experience China's imperial past and vibrant present"
  },
  {
    id: 2,
    name: 'Family Adventure Tour',
    startCity: 'Beijing',
    endCity: "Xi'an",
    days: 5,
    tags: ['5-day', 'Family Friendly', 'Educational'],
    description: 'Perfect introduction to Chinese history for families'
  },
  {
    id: 3,
    name: 'City Explorer Route',
    startCity: 'Shanghai',
    endCity: 'Suzhou',
    days: 3,
    tags: ['3-day', 'Urban', 'Modern'],
    description: 'Modern cities and traditional gardens'
  },
  {
    id: 4,
    name: 'Silk Road Adventure',
    startCity: "Xi'an",
    endCity: 'Dunhuang',
    days: 10,
    tags: ['10-day', 'Historic', 'Adventure'],
    description: 'Trace the ancient trade route through deserts and grottoes'
  },
  {
    id: 5,
    name: 'Yunnan Minority Exploration',
    startCity: 'Kunming',
    endCity: 'Lijiang',
    days: 8,
    tags: ['8-day', 'Cultural', 'Scenic'],
    description: 'Discover the diverse cultures and landscapes of Southwest China'
  },
  {
    id: 6,
    name: 'Tibet Spiritual Journey',
    startCity: 'Lhasa',
    endCity: 'Shigatse',
    days: 6,
    tags: ['6-day', 'Spiritual', 'High-Altitude'],
    description: 'A journey to the roof of the world, visiting sacred sites'
  },
  {
    id: 7,
    name: 'Yangtze River Cruise',
    startCity: 'Chongqing',
    endCity: 'Yichang',
    days: 4,
    tags: ['4-day', 'Cruise', 'Relaxing'],
    description: 'Sail through the stunning Three Gorges on a luxury cruise'
  },
  {
    id: 8,
    name: 'Southern China Scenic Tour',
    startCity: 'Guilin',
    endCity: 'Hong Kong',
    days: 9,
    tags: ['9-day', 'Scenic', 'Urban'],
    description: 'From karst landscapes to a bustling international metropolis'
  },
  {
    id: 9,
    name: 'Panda & Nature Reserve Trip',
    startCity: 'Chengdu',
    endCity: 'Jiuzhaigou',
    days: 7,
    tags: ['7-day', 'Nature', 'Wildlife'],
    description: 'Get up close with giant pandas and explore colorful lakes'
  },
  {
    id: 10,
    name: 'Historical Capitals Tour',
    startCity: 'Beijing',
    endCity: 'Nanjing',
    days: 8,
    tags: ['8-day', 'Historic', 'Cultural'],
    description: "A deep dive into the rich history of China's ancient capitals"
  }
];

const spots: Spot[] = [
  {
    id: 1,
    name: 'Forbidden City',
    destination: 'Beijing',
    description: 'Imperial palace complex with 600 years of history',
    image: '/placeholder.svg',
    category: 'Historic'
  },
  {
    id: 2,
    name: 'Terracotta Warriors',
    destination: "Xi'an",
    description: 'Ancient army of clay soldiers guarding an emperor',
    image: '/placeholder.svg',
    category: 'Archaeological'
  },
  {
    id: 3,
    name: 'The Bund',
    destination: 'Shanghai',
    description: 'Iconic waterfront with colonial architecture',
    image: '/placeholder.svg',
    category: 'Architecture'
  },
  {
    id: 4,
    name: 'Chengdu Panda Base',
    destination: 'Chengdu',
    description: 'Research and breeding center for giant pandas',
    image: '/placeholder.svg',
    category: 'Wildlife'
  },
  {
    id: 5,
    name: 'Li River Cruise',
    destination: 'Guilin',
    description: 'Breathtaking boat journey through karst peaks',
    image: '/placeholder.svg',
    category: 'Scenic'
  },
  {
    id: 6,
    name: 'West Lake',
    destination: 'Hangzhou',
    description: 'A serene and culturally rich lake in eastern China',
    image: '/placeholder.svg',
    category: 'Nature'
  },
  {
    id: 7,
    name: 'Potala Palace',
    destination: 'Lhasa',
    description: 'The winter palace of the Dalai Lamas since the 7th century',
    image: '/placeholder.svg',
    category: 'Historic'
  },
  {
    id: 8,
    name: 'Zhangjiajie National Forest Park',
    destination: 'Zhangjiajie',
    description: 'The inspiration for the floating mountains in the movie Avatar',
    image: '/placeholder.svg',
    category: 'Nature'
  },
  {
    id: 9,
    name: 'Yellow Mountain (Huangshan)',
    destination: 'Huangshan',
    description: 'A majestic mountain range known for its unique scenery',
    image: '/placeholder.svg',
    category: 'Nature'
  },
  {
    id: 10,
    name: "Humble Administrator's Garden",
    destination: 'Suzhou',
    description: 'A masterpiece of classical Chinese garden design',
    image: '/placeholder.svg',
    category: 'Garden'
  }
];

export const fetchExploreData = (): Promise<ExploreData> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ destinations, routes, spots });
    }, 1000); // Simulate 1 second network delay
  });
};

// Mock user's favorite items
export const myFavorites: (Destination | Route | Spot)[] = [
  destinations[0], // Favorite Beijing
  routes[1],       // Favorite Family Adventure Tour
];

export interface MyData {
    myFavorites: (Destination | Route | Spot)[];
}

export const fetchMyData = (): Promise<MyData> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ myFavorites });
    }, 500); // Simulate network delay
  });
};
