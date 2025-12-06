
export interface Property {
  id: string;
  name: string;
  address: string;
  pricePerNight: number;
  imageUrl?: string;
  experienceDescription?: string; // Novo: Para descrever a experiência (ex: "Casa pé na areia, ideal para...")
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  tags: string[];
  totalStays: number;
  lastStayDate?: string;
}

export enum BookingStatus {
  Confirmed = 'Confirmado',
  Pending = 'Pendente',
  Completed = 'Concluído',
  Cancelled = 'Cancelado'
}

export interface Booking {
  id: string;
  propertyId: string;
  guestId: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  totalPrice: number;
  stayNotes?: string;
}

// --- Tipos para Locação Mensal (Kitnets) ---

export enum PaymentStatus {
  Paid = 'Pago',
  Pending = 'Pendente',
  Late = 'Atrasado'
}

export interface Kitnet {
  id: string;
  name: string;
  address: string;
  rentValue: number;
  status: 'Occupied' | 'Vacant' | 'Maintenance';
  tenantId?: string;
}

export interface Tenant {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  entryDate: string;
  endDate?: string;
  status: 'Active' | 'Past';
  notes?: string;
}

export interface RentPayment {
  id: string;
  kitnetId: string;
  tenantId: string;
  dueDate: string;
  amount: number;
  status: PaymentStatus;
  paidDate?: string;
}

export interface MaintenanceRecord {
  id: string;
  kitnetId?: string; // Se for null, é manutenção do prédio/geral
  description: string;
  date: string;
  cost: number;
  status: 'Pending' | 'Completed';
}
