
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CRMModule from './components/CRMModule';
import LongTermRentals from './components/LongTermRentals';
import MarketingModule from './components/MarketingModule'; // Import New Module
import { StorageService } from './services/storage';
import { Guest, Booking, Property, Kitnet, Tenant, RentPayment, PaymentStatus, BookingStatus, MaintenanceRecord } from './types';
import { Plus, Trash2, MapPin, X, Calendar, Edit2, CheckCircle, AlertCircle } from 'lucide-react';

interface PropertiesListProps {
  properties: Property[];
  onAdd: (p: Omit<Property, 'id'>) => void;
  onDelete: (id: string) => void;
}

const PropertiesList: React.FC<PropertiesListProps> = ({ properties, onAdd, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    pricePerNight: '',
    imageUrl: '',
    experienceDescription: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name: formData.name,
      address: formData.address,
      pricePerNight: Number(formData.pricePerNight),
      imageUrl: formData.imageUrl || `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`,
      experienceDescription: formData.experienceDescription
    });
    setIsModalOpen(false);
    setFormData({ name: '', address: '', pricePerNight: '', imageUrl: '', experienceDescription: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Propriedades Airbnb</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-rose-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-rose-700 transition"
        >
            <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(p => (
              <div key={p.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow group relative">
                  <div className="h-48 bg-gray-200 relative">
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-bold shadow">
                          R$ {p.pricePerNight}/noite
                      </div>
                  </div>
                  <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 pr-8">{p.name}</h3>
                      <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" /> {p.address}
                      </p>
                      {p.experienceDescription && (
                          <p className="text-xs text-gray-400 mt-2 line-clamp-2 italic">"{p.experienceDescription}"</p>
                      )}
                  </div>
                  <button 
                    onClick={() => {
                        if(window.confirm('Tem certeza que deseja excluir esta propriedade?')) {
                            onDelete(p.id);
                        }
                    }}
                    className="absolute top-3 left-3 bg-white p-2 rounded-full shadow-md text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                    title="Excluir Propriedade"
                  >
                      <Trash2 className="w-4 h-4" />
                  </button>
              </div>
          ))}
      </div>

      {/* Modal de Adição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">Nova Propriedade</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Propriedade</label>
                        <input required type="text" className="w-full border rounded-lg px-3 py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                        <input required type="text" className="w-full border rounded-lg px-3 py-2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preço por Noite (R$)</label>
                        <input required type="number" className="w-full border rounded-lg px-3 py-2" value={formData.pricePerNight} onChange={e => setFormData({...formData, pricePerNight: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Experiência / Vibe (Para IA)</label>
                        <textarea 
                            className="w-full border rounded-lg px-3 py-2" 
                            value={formData.experienceDescription} 
                            onChange={e => setFormData({...formData, experienceDescription: e.target.value})}
                            placeholder="Ex: Ambiente calmo, perfeito para home office, decoração rústica..."
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem (Opcional)</label>
                        <input type="url" className="w-full border rounded-lg px-3 py-2" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                    </div>
                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancelar</button>
                        <button type="submit" className="flex-1 py-2 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

const BookingsList: React.FC<{ bookings: Booking[]; properties: Property[]; guests: Guest[]; onAddBooking: (b: Omit<Booking, 'id'>) => void; onUpdateBooking: (b: Booking) => void; }> = ({ bookings, properties, guests, onAddBooking, onUpdateBooking }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    
    // Form States
    const [formData, setFormData] = useState({ propertyId: '', guestId: '', startDate: '', endDate: '', customPrice: '', stayNotes: '' });
    const [editData, setEditData] = useState<Booking | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddBooking({
            propertyId: formData.propertyId, guestId: formData.guestId, startDate: formData.startDate, endDate: formData.endDate,
            status: BookingStatus.Confirmed, totalPrice: Number(formData.customPrice), stayNotes: formData.stayNotes
        });
        setIsAddModalOpen(false);
        setFormData({ propertyId: '', guestId: '', startDate: '', endDate: '', customPrice: '', stayNotes: '' });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(editData) {
            onUpdateBooking(editData);
            setIsEditModalOpen(false);
            setSelectedBooking(null);
        }
    };

    const openEditModal = (booking: Booking) => {
        setSelectedBooking(booking);
        setEditData({ ...booking });
        setIsEditModalOpen(true);
    };

    const getStatusColor = (status: BookingStatus) => {
        switch(status) {
            case BookingStatus.Confirmed: return 'bg-blue-100 text-blue-700';
            case BookingStatus.Completed: return 'bg-green-100 text-green-700';
            case BookingStatus.Cancelled: return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Reservas</h2><button onClick={()=>setIsAddModalOpen(true)} className="bg-rose-600 text-white px-4 py-2 rounded-lg flex gap-2"><Plus className="w-4 h-4"/> Nova Reserva</button></div>
             <div className="bg-white rounded-xl shadow border overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4">Propriedade</th>
                            <th className="p-4">Hóspede</th>
                            <th className="p-4">Data</th>
                            <th className="p-4">Preço</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map(b => (
                            <tr key={b.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">{properties.find(p=>p.id===b.propertyId)?.name}</td>
                                <td className="p-4">{guests.find(g=>g.id===b.guestId)?.name}</td>
                                <td className="p-4">{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</td>
                                <td className="p-4 font-medium">R$ {b.totalPrice}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(b.status)}`}>{b.status}</span>
                                </td>
                                <td className="p-4">
                                    <button onClick={() => openEditModal(b)} className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-800 transition">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
             
             {/* New Booking Modal */}
             {isAddModalOpen && (
                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                     <div className="bg-white p-6 rounded-xl w-full max-w-lg">
                         <h3 className="font-bold mb-4">Nova Reserva</h3>
                         <form onSubmit={handleSubmit} className="space-y-4">
                             <select className="w-full border p-2 rounded" onChange={e=>setFormData({...formData, guestId:e.target.value})}><option>Hóspede</option>{guests.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select>
                             <select className="w-full border p-2 rounded" onChange={e=>setFormData({...formData, propertyId:e.target.value})}><option>Propriedade</option>{properties.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
                             <div className="flex gap-2"><input type="date" className="w-full border p-2 rounded" onChange={e=>setFormData({...formData, startDate:e.target.value})} /><input type="date" className="w-full border p-2 rounded" onChange={e=>setFormData({...formData, endDate:e.target.value})} /></div>
                             <input type="number" placeholder="Preço Total" className="w-full border p-2 rounded" onChange={e=>setFormData({...formData, customPrice:e.target.value})} />
                             <textarea placeholder="Obs da Estadia" className="w-full border p-2 rounded" onChange={e=>setFormData({...formData, stayNotes:e.target.value})} />
                             <button type="submit" className="w-full bg-rose-600 text-white py-2 rounded">Salvar</button>
                             <button type="button" onClick={()=>setIsAddModalOpen(false)} className="w-full text-gray-500 py-2">Cancelar</button>
                         </form>
                     </div>
                 </div>
             )}

             {/* Edit Booking Modal */}
             {isEditModalOpen && editData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Editar Reserva</h3>
                            <button onClick={()=>setIsEditModalOpen(false)}><X className="w-5 h-5 text-gray-500"/></button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 grid grid-cols-2 gap-2">
                                <p><strong>Hóspede:</strong> {guests.find(g => g.id === editData.guestId)?.name}</p>
                                <p><strong>Imóvel:</strong> {properties.find(p => p.id === editData.propertyId)?.name}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select 
                                    className="w-full border p-2 rounded" 
                                    value={editData.status} 
                                    onChange={e => setEditData({...editData, status: e.target.value as BookingStatus})}
                                >
                                    {Object.values(BookingStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Observações da Estadia</label>
                                <textarea 
                                    className="w-full border p-2 rounded h-32 focus:ring-2 focus:ring-rose-500 outline-none" 
                                    value={editData.stayNotes || ''} 
                                    onChange={e => setEditData({...editData, stayNotes: e.target.value})}
                                    placeholder="Anote detalhes importantes sobre a estadia..."
                                />
                            </div>

                            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded font-medium hover:bg-indigo-700 transition">Salvar Alterações</button>
                        </form>
                    </div>
                </div>
             )}
        </div>
    );
};

const App: React.FC = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [kitnets, setKitnets] = useState<Kitnet[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<RentPayment[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);

  useEffect(() => {
    StorageService.init();
    setGuests(StorageService.getGuests());
    setProperties(StorageService.getProperties());
    setBookings(StorageService.getBookings());
    setKitnets(StorageService.getKitnets());
    setTenants(StorageService.getTenants());
    setPayments(StorageService.getPayments());
    setMaintenance(StorageService.getMaintenance());
  }, []);

  /* Handlers */
  const handleUpdateGuest = (g: Guest) => { const n = guests.map(x => x.id === g.id ? g : x); setGuests(n); StorageService.saveGuests(n); };
  const handleAddGuest = (d: Omit<Guest, 'id'>) => { const n = [...guests, { id: `g${Date.now()}`, ...d }]; setGuests(n); StorageService.saveGuests(n); };
  const handleDeleteGuest = (id: string) => { const n = guests.filter(x => x.id !== id); setGuests(n); StorageService.saveGuests(n); };
  
  const handleAddProperty = (d: Omit<Property, 'id'>) => { const n = [...properties, { id: `p${Date.now()}`, ...d }]; setProperties(n); StorageService.saveProperties(n); };
  const handleDeleteProperty = (id: string) => { const n = properties.filter(x => x.id !== id); setProperties(n); StorageService.saveProperties(n); };

  const handleAddBooking = (d: Omit<Booking, 'id'>) => { const n = [...bookings, { id: `b${Date.now()}`, ...d }]; setBookings(n); StorageService.saveBookings(n); };
  const handleUpdateBooking = (b: Booking) => { const n = bookings.map(x => x.id === b.id ? b : x); setBookings(n); StorageService.saveBookings(n); };

  const handleUpdateKitnet = (k: Kitnet) => { const n = kitnets.map(x => x.id === k.id ? k : x); setKitnets(n); StorageService.saveKitnets(n); };
  const handleAddKitnet = (d: Omit<Kitnet, 'id'>) => { const n = [...kitnets, { id: `k${Date.now()}`, ...d }]; setKitnets(n); StorageService.saveKitnets(n); };
  const handleDeleteKitnet = (id: string) => { const n = kitnets.filter(x => x.id !== id); setKitnets(n); StorageService.saveKitnets(n); };
  
  const handleUpdateTenant = (t: Tenant) => { const n = tenants.map(x => x.id === t.id ? t : x); setTenants(n); StorageService.saveTenants(n); };
  const handleAddTenant = (t: Omit<Tenant, 'id'>) => { 
      const newTenant = { id: `t${Date.now()}`, ...t };
      const n = [...tenants, newTenant]; 
      setTenants(n); 
      StorageService.saveTenants(n); 
      return newTenant;
  };

  const handlePaymentUpdate = (id: string, s: PaymentStatus) => { const n = payments.map(p => p.id === id ? { ...p, status: s, paidDate: s === 'Pago' ? new Date().toISOString() : undefined } : p); setPayments(n); StorageService.savePayments(n); };

  const handleAddMaintenance = (d: Omit<MaintenanceRecord, 'id'>) => { const n = [...maintenance, { id: `m${Date.now()}`, ...d }]; setMaintenance(n); StorageService.saveMaintenance(n); };

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard bookings={bookings} guests={guests} />} />
          <Route path="/guests" element={<CRMModule guests={guests} bookings={bookings} properties={properties} onUpdateGuest={handleUpdateGuest} onAddGuest={handleAddGuest} onDeleteGuest={handleDeleteGuest} />} />
          <Route path="/properties" element={<PropertiesList properties={properties} onAdd={handleAddProperty} onDelete={handleDeleteProperty} />} />
          <Route path="/bookings" element={<BookingsList bookings={bookings} properties={properties} guests={guests} onAddBooking={handleAddBooking} onUpdateBooking={handleUpdateBooking} />} />
          <Route path="/kitnets" element={<LongTermRentals kitnets={kitnets} tenants={tenants} payments={payments} maintenance={maintenance} onPaymentUpdate={handlePaymentUpdate} onUpdateTenant={handleUpdateTenant} onUpdateKitnet={handleUpdateKitnet} onAddKitnet={handleAddKitnet} onDeleteKitnet={handleDeleteKitnet} onAddMaintenance={handleAddMaintenance} onAddTenant={handleAddTenant} />} />
          <Route path="/marketing" element={<MarketingModule guests={guests} properties={properties} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
