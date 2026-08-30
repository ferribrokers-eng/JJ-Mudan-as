export interface InventoryItem {
  id: string;
  name: string;
  room: string;
  quantity: number;
  volume: number; // m³ per unit
  observation?: string;
  isCustom?: boolean;
}

export interface PresetItem {
  name: string;
  volume: number; // m³
  category: string;
}

export interface RoomPreset {
  id: string;
  name: string;
  icon: string;
  items: PresetItem[];
}

export interface MaterialItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

export interface AddressInfo {
  address: string; // Street name
  number?: string;  // House/apartment number
  neighborhood?: string;
  city: string;
  state: string;
  cep?: string;
  floor: string;
  hasElevator: boolean;
  needsPacking: boolean;
  parkingDistance: 'near' | 'medium' | 'far'; // < 15m, 15-30m, > 30m
  hasStairs?: boolean;
  stairsFlights?: number;
}

export interface ClientInfo {
  name: string;
  email: string;
  whatsapp: string;
  moveDate: string;
  residenceType: 'casa' | 'apartamento' | 'sobrado' | 'comercial' | 'loja';
  observations: string;
}

export interface MoveProposal {
  id: string;
  client: ClientInfo;
  origin: AddressInfo;
  destination: AddressInfo;
  items: InventoryItem[];
  materials: MaterialItem[];
  services: ServiceItem[];
  createdAt: string;
  distanceKm?: string;
  durationMin?: number;
  estimatedValue?: number;
}

export interface CompanyClient {
  id: string; // slug e.g. "empresa-exemplo"
  slug: string;
  email: string;
  password?: string;
  companyName: string;
  whatsapp: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  createdAt?: string;
  updatedAt?: string;
}

