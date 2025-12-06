
import { Guest, Property, Booking, BookingStatus, Kitnet, Tenant, RentPayment, PaymentStatus, MaintenanceRecord } from '../types';

const STORAGE_KEYS = {
  GUESTS: 'hospedecrm_guests',
  PROPERTIES: 'hospedecrm_properties',
  BOOKINGS: 'hospedecrm_bookings',
  KITNETS: 'hospedecrm_kitnets',
  TENANTS: 'hospedecrm_tenants',
  PAYMENTS: 'hospedecrm_payments',
  MAINTENANCE: 'hospedecrm_maintenance',
};

// Seed data
const SEED_PROPERTIES: Property[] = [
  { 
    id: 'p1', 
    name: 'Loft Urbano Centro', 
    address: 'Rua das Flores, 123, Centro', 
    pricePerNight: 250, 
    imageUrl: 'https://picsum.photos/400/300?random=1',
    experienceDescription: 'Perfeito para nômades digitais e casais. Perto de cafeterias, internet fibra ótica, decoração industrial moderna.'
  },
  { 
    id: 'p2', 
    name: 'Casa de Praia Solar', 
    address: 'Av. Beira Mar, 400, Praia Azul', 
    pricePerNight: 500, 
    imageUrl: 'https://picsum.photos/400/300?random=2',
    experienceDescription: 'Experiência pé na areia para famílias. Área de churrasco, piscina infantil, vista para o mar e muito sol.'
  },
  { 
    id: 'p3', 
    name: 'Cabana na Montanha', 
    address: 'Estrada da Serra, km 50', 
    pricePerNight: 350, 
    imageUrl: 'https://picsum.photos/400/300?random=3',
    experienceDescription: 'Refúgio romântico e isolado. Lareira, vinho, trilhas na natureza e silêncio absoluto.' 
  },
];

const SEED_GUESTS: Guest[] = [
  { id: 'g1', name: 'Carlos Silva', email: 'carlos.silva@email.com', phone: '(11) 99999-1111', notes: 'Gosta de café extra. Viaja a trabalho.', tags: ['Negócios', 'Recorrente'], totalStays: 3, lastStayDate: '2023-11-15' },
  { id: 'g2', name: 'Ana Souza', email: 'ana.souza@email.com', phone: '(21) 98888-2222', notes: 'Viaja com cachorro pequeno.', tags: ['Pet Lover', 'Família'], totalStays: 1, lastStayDate: '2023-12-20' },
  { id: 'g3', name: 'Roberto Mendes', email: 'beto.m@email.com', phone: '(31) 97777-3333', notes: 'Prefere check-in self-service.', tags: ['VIP'], totalStays: 5, lastStayDate: '2024-01-10' },
];

const SEED_BOOKINGS: Booking[] = [
  { id: 'b1', propertyId: 'p1', guestId: 'g1', startDate: '2023-11-10', endDate: '2023-11-15', status: BookingStatus.Completed, totalPrice: 1250, stayNotes: 'Hóspede esqueceu o carregador, guardamos na recepção.' },
  { id: 'b2', propertyId: 'p2', guestId: 'g2', startDate: '2023-12-15', endDate: '2023-12-20', status: BookingStatus.Completed, totalPrice: 2500, stayNotes: 'Cachorrinho fez bagunça no jardim, mas pagaram taxa extra.' },
  { id: 'b3', propertyId: 'p1', guestId: 'g3', startDate: '2024-01-05', endDate: '2024-01-10', status: BookingStatus.Completed, totalPrice: 1250, stayNotes: 'Solicitou late check-out.' },
  { id: 'b4', propertyId: 'p3', guestId: 'g1', startDate: '2024-02-20', endDate: '2024-02-25', status: BookingStatus.Confirmed, totalPrice: 1750 },
];

const SEED_KITNETS: Kitnet[] = [
  { id: 'k1', name: 'Kitnet 01 - Térreo', address: 'Rua dos Estudantes, 55', rentValue: 800, status: 'Occupied', tenantId: 't1' },
  { id: 'k2', name: 'Kitnet 02 - Térreo', address: 'Rua dos Estudantes, 55', rentValue: 850, status: 'Vacant' },
  { id: 'k3', name: 'Kitnet 101 - 1º Andar', address: 'Rua dos Estudantes, 55', rentValue: 900, status: 'Occupied', tenantId: 't2' },
];

const SEED_TENANTS: Tenant[] = [
  { id: 't1', name: 'João Pedro', cpf: '123.456.789-00', phone: '(11) 95555-5555', email: 'joao.p@email.com', entryDate: '2023-06-01', status: 'Active', notes: 'Bom pagador. Trabalha home office.' },
  { id: 't2', name: 'Maria Clara', cpf: '987.654.321-99', phone: '(11) 94444-4444', email: 'maria.c@email.com', entryDate: '2024-01-15', status: 'Active' },
];

const SEED_PAYMENTS: RentPayment[] = [
  { id: 'py1', kitnetId: 'k1', tenantId: 't1', dueDate: '2024-02-05', amount: 800, status: PaymentStatus.Paid, paidDate: '2024-02-04' },
  { id: 'py2', kitnetId: 'k1', tenantId: 't1', dueDate: '2024-03-05', amount: 800, status: PaymentStatus.Pending },
  { id: 'py3', kitnetId: 'k3', tenantId: 't2', dueDate: '2024-02-15', amount: 900, status: PaymentStatus.Late },
];

const SEED_MAINTENANCE: MaintenanceRecord[] = [
    { id: 'm1', description: 'Pintura do Muro Frontal', date: '2024-01-10', cost: 450, status: 'Completed' },
    { id: 'm2', description: 'Troca de Fechadura Portão Principal', date: '2024-02-01', cost: 120, status: 'Completed' },
];

export const StorageService = {
  getProperties: (): Property[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
    return data ? JSON.parse(data) : SEED_PROPERTIES;
  },
  saveProperties: (data: Property[]) => localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(data)),

  getGuests: (): Guest[] => {
    const data = localStorage.getItem(STORAGE_KEYS.GUESTS);
    return data ? JSON.parse(data) : SEED_GUESTS;
  },
  saveGuests: (data: Guest[]) => localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(data)),

  getBookings: (): Booking[] => {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return data ? JSON.parse(data) : SEED_BOOKINGS;
  },
  saveBookings: (data: Booking[]) => localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(data)),

  getKitnets: (): Kitnet[] => {
    const data = localStorage.getItem(STORAGE_KEYS.KITNETS);
    return data ? JSON.parse(data) : SEED_KITNETS;
  },
  saveKitnets: (data: Kitnet[]) => localStorage.setItem(STORAGE_KEYS.KITNETS, JSON.stringify(data)),

  getTenants: (): Tenant[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TENANTS);
    return data ? JSON.parse(data) : SEED_TENANTS;
  },
  saveTenants: (data: Tenant[]) => localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(data)),

  getPayments: (): RentPayment[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return data ? JSON.parse(data) : SEED_PAYMENTS;
  },
  savePayments: (data: RentPayment[]) => localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(data)),

  getMaintenance: (): MaintenanceRecord[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MAINTENANCE);
    return data ? JSON.parse(data) : SEED_MAINTENANCE;
  },
  saveMaintenance: (data: MaintenanceRecord[]) => localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(data)),
  
  init: () => {
    if (!localStorage.getItem(STORAGE_KEYS.PROPERTIES)) localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(SEED_PROPERTIES));
    if (!localStorage.getItem(STORAGE_KEYS.GUESTS)) localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(SEED_GUESTS));
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(SEED_BOOKINGS));
    if (!localStorage.getItem(STORAGE_KEYS.KITNETS)) localStorage.setItem(STORAGE_KEYS.KITNETS, JSON.stringify(SEED_KITNETS));
    if (!localStorage.getItem(STORAGE_KEYS.TENANTS)) localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(SEED_TENANTS));
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(SEED_PAYMENTS));
    if (!localStorage.getItem(STORAGE_KEYS.MAINTENANCE)) localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(SEED_MAINTENANCE));
  }
};
