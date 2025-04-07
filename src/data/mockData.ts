
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: 'hair' | 'face' | 'body' | 'barber';
  image: string;
}

export interface Professional {
  id: string;
  name: string;
  email: string; // Adicionando a propriedade email
  role: string;
  services: string[]; // service ids
  image: string;
  rating: number;
  reviewCount: number;
  about: string;
  schedule: { // Renomeando de availability para schedule para consistência
    [key: string]: string[]; // day: available times
  };
}

export interface Appointment {
  id: string;
  serviceId: string;
  professionalId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export const services: Service[] = [
  {
    id: "1",
    name: "Corte de Cabelo",
    description: "Corte personalizado de acordo com seu estilo e tipo de cabelo.",
    price: 80,
    duration: 45,
    category: "hair",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "2",
    name: "Barba",
    description: "Aparo e modelagem de barba com produtos especiais.",
    price: 50,
    duration: 30,
    category: "barber",
    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "3",
    name: "Limpeza de Pele",
    description: "Limpeza profunda com extração de impurezas e hidratação.",
    price: 120,
    duration: 60,
    category: "face",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "4",
    name: "Massagem Relaxante",
    description: "Massagem corporal que alivia tensões e proporciona relaxamento.",
    price: 150,
    duration: 60,
    category: "body",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "5",
    name: "Coloração",
    description: "Mudança ou retoque de cor com produtos profissionais.",
    price: 180,
    duration: 120,
    category: "hair",
    image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "6",
    name: "Manicure e Pedicure",
    description: "Tratamento completo para unhas das mãos e pés.",
    price: 90,
    duration: 60,
    category: "body",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "7",
    name: "Depilação com Cera",
    description: "Remoção de pelos com cera quente ou fria.",
    price: 100,
    duration: 45,
    category: "body",
    image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "8",
    name: "Hidratação Capilar",
    description: "Tratamento intensivo para cabelos ressecados e danificados.",
    price: 110,
    duration: 45,
    category: "hair",
    image: "https://images.unsplash.com/photo-1626728548704-5bbdb67993a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  }
];

export const professionals: Professional[] = [
  {
    id: "1",
    name: "Ana Silva",
    email: "ana.silva@salao.com", // Adicionando email
    role: "Esteticista Facial",
    services: ["3"],
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    rating: 4.8,
    reviewCount: 142,
    about: "Ana é especialista em tratamentos faciais com mais de 8 anos de experiência. Formada em Estética e Cosmética, ela se especializa em limpezas de pele e tratamentos para rejuvenescimento.",
    schedule: { // Renomeado de availability para schedule
      "Segunda": ["9:00", "10:00", "14:00", "15:00", "16:00"],
      "Terça": ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      "Quarta": ["14:00", "15:00", "16:00", "17:00"],
      "Quinta": ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      "Sexta": ["9:00", "10:00", "11:00", "14:00", "15:00"]
    }
  },
  {
    id: "2",
    name: "Carlos Oliveira",
    email: "carlos.oliveira@salao.com", // Adicionando email
    role: "Barbeiro",
    services: ["1", "2"],
    image: "https://images.unsplash.com/photo-1578176603894-57973e38890f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    rating: 4.9,
    reviewCount: 203,
    about: "Carlos é um barbeiro premiado com técnicas apuradas em cortes masculinos e cuidados com a barba. Com cursos no exterior, traz as últimas tendências para seus clientes.",
    schedule: { // Renomeado de availability para schedule
      "Segunda": ["10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
      "Terça": ["10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
      "Quarta": ["10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
      "Quinta": ["10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
      "Sexta": ["10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
      "Sábado": ["9:00", "10:00", "11:00", "12:00"]
    }
  },
  {
    id: "3",
    name: "Juliana Costa",
    email: "juliana.costa@salao.com", // Adicionando email
    role: "Cabeleireira",
    services: ["1", "5", "8"],
    image: "https://images.unsplash.com/photo-1589316290949-5be1bcd73165?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    rating: 4.7,
    reviewCount: 176,
    about: "Juliana trabalha com coloração e cortes femininos há mais de 10 anos. Especialista em técnicas de mechas e coloração, busca sempre se atualizar com as tendências internacionais.",
    schedule: { // Renomeado de availability para schedule
      "Segunda": ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
      "Terça": ["9:00", "10:00", "11:00", "13:00", "14:00", "15:00"],
      "Quarta": ["9:00", "10:00", "11:00", "13:00", "14:00", "15:00"],
      "Quinta": ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
      "Sexta": ["9:00", "10:00", "11:00", "13:00", "14:00", "15:00"],
      "Sábado": ["9:00", "10:00", "11:00", "12:00"]
    }
  },
  {
    id: "4",
    name: "Roberto Santos",
    email: "roberto.santos@salao.com", // Adicionando email
    role: "Massoterapeuta",
    services: ["4"],
    image: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    rating: 4.9,
    reviewCount: 98,
    about: "Roberto é formado em fisioterapia com especialização em massoterapia. Trabalha com diversas técnicas de massagem, focando no alívio de tensões e bem-estar completo.",
    schedule: { // Renomeado de availability para schedule
      "Segunda": ["9:00", "10:00", "11:00", "15:00", "16:00", "17:00"],
      "Terça": ["9:00", "10:00", "11:00", "15:00", "16:00", "17:00"],
      "Quarta": ["9:00", "10:00", "11:00", "15:00", "16:00", "17:00"],
      "Quinta": ["9:00", "10:00", "11:00", "15:00", "16:00", "17:00"],
      "Sexta": ["9:00", "10:00", "11:00", "15:00", "16:00", "17:00"]
    }
  },
  {
    id: "5",
    name: "Patricia Mendes",
    email: "patricia.mendes@salao.com", // Adicionando email
    role: "Manicure e Pedicure",
    services: ["6"],
    image: "https://images.unsplash.com/photo-1605980776566-0486c3ac7603?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    rating: 4.6,
    reviewCount: 124,
    about: "Patricia é especialista em unhas, com técnicas apuradas em esmaltação em gel, nail art e cuidados com cutículas. Atende com muita dedicação e capricho.",
    schedule: { // Renomeado de availability para schedule
      "Segunda": ["9:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
      "Terça": ["9:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
      "Quarta": ["9:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
      "Quinta": ["9:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
      "Sexta": ["9:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"]
    }
  },
  {
    id: "6",
    name: "Fernando Lima",
    email: "fernando.lima@salao.com", // Adicionando email
    role: "Esteticista Corporal",
    services: ["4", "7"],
    image: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    rating: 4.8,
    reviewCount: 87,
    about: "Fernando é um profissional dedicado à estética corporal, com foco em tratamentos redutores e modeladores. Formado em Fisioterapia e Estética, traz resultados surpreendentes.",
    schedule: { // Renomeado de availability para schedule
      "Segunda": ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      "Terça": ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      "Quarta": ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      "Quinta": ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      "Sexta": ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
    }
  }
];

export const getServicesByProfessional = (professionalId: string): Service[] => {
  const professional = professionals.find(p => p.id === professionalId);
  if (!professional) return [];
  
  return services.filter(service => professional.services.includes(service.id));
};

export const getProfessionalsByService = (serviceId: string): Professional[] => {
  return professionals.filter(professional => professional.services.includes(serviceId));
};

export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};
