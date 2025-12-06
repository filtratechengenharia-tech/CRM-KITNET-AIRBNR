import React, { useState } from 'react';
import { Search, Mail, Phone, Tag, Clock, ChevronRight, MessageSquare, Sparkles, Users, MessageCircle, Plus, Trash2, X, Send, Copy } from 'lucide-react';
import { Guest, Booking, Property } from '../types';
import { GeminiService } from '../services/gemini';

interface CRMModuleProps {
  guests: Guest[];
  bookings: Booking[];
  properties: Property[];
  onUpdateGuest: (guest: Guest) => void;
  onAddGuest: (guest: Omit<Guest, 'id'>) => void;
  onDeleteGuest: (id: string) => void;
}

const CRMModule: React.FC<CRMModuleProps> = ({ guests, bookings, properties, onUpdateGuest, onAddGuest, onDeleteGuest }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'ai'>('details');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [newGuestData, setNewGuestData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    tags: ''
  });

  const filteredGuests = guests.filter(guest => 
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateMessage = async (type: 'welcome' | 'thank_you' | 'offer') => {
    if (!selectedGuest) return;
    setIsGenerating(true);
    setAiResponse(null);
    try {
      // Encontrar a reserva mais recente ou relevante para dar contexto
      const guestBookings = bookings.filter(b => b.guestId === selectedGuest.id);
      const lastBooking = guestBookings.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0];

      const result = await GeminiService.generateGuestEmail(selectedGuest, type, undefined, lastBooking);
      setAiResponse(result);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyzeStrategy = async () => {
    if (!selectedGuest) return;
    setIsGenerating(true);
    setAiResponse(null);
    try {
      const result = await GeminiService.analyzeGuestStrategy(selectedGuest, bookings, properties);
      setAiResponse(result);
    } finally {
      setIsGenerating(false);
    }
  };

  const openWhatsApp = (phone: string, text?: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    let url = `https://wa.me/${finalPhone}`;
    if (text) {
        url += `?text=${encodeURIComponent(text)}`;
    }
    window.open(url, '_blank');
  };

  const openEmail = (email: string, text: string) => {
      window.open(`mailto:${email}?subject=Mensagem sobre sua estadia&body=${encodeURIComponent(text)}`);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddGuest({
        name: newGuestData.name,
        email: newGuestData.email,
        phone: newGuestData.phone,
        notes: newGuestData.notes,
        tags: newGuestData.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
        totalStays: 0
    });
    setIsAddModalOpen(false);
    setNewGuestData({ name: '', email: '', phone: '', notes: '', tags: '' });
  };

  const handleDelete = () => {
      if (!selectedGuest) return;
      if (window.confirm(`Tem certeza que deseja excluir ${selectedGuest.name}?`)) {
          onDeleteGuest(selectedGuest.id);
          setSelectedGuest(null);
      }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
      {/* List Sidebar */}
      <div className={`w-full md:w-1/3 border-r flex flex-col ${selectedGuest ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b space-y-3">
          <div className="flex justify-between items-center">
             <h3 className="font-bold text-gray-800">Meus Hóspedes</h3>
             <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-rose-100 text-rose-600 p-2 rounded-lg hover:bg-rose-200 transition"
                title="Adicionar Hóspede"
             >
                <Plus className="w-5 h-5" />
             </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredGuests.map(guest => (
            <div
              key={guest.id}
              onClick={() => {
                setSelectedGuest(guest);
                setAiResponse(null);
                setActiveTab('details');
              }}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${selectedGuest?.id === guest.id ? 'bg-rose-50 border-l-4 border-l-rose-500' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{guest.name}</h3>
                  <p className="text-sm text-gray-500">{guest.email}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                    {guest.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{tag}</span>
                    ))}
                </div>
                {/* Mini WhatsApp Button in List */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        openWhatsApp(guest.phone);
                    }}
                    className="p-1 text-green-600 hover:bg-green-50 rounded-full"
                    title="WhatsApp Rápido"
                >
                    <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail View */}
      {selectedGuest ? (
        <div className="w-full md:w-2/3 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b flex flex-col sm:flex-row justify-between items-start gap-4 bg-gray-50">
            <div>
               <button 
                onClick={() => setSelectedGuest(null)}
                className="md:hidden mb-2 text-sm text-gray-500 hover:text-gray-800 flex items-center"
              >
                &larr; Voltar
              </button>
              <h2 className="text-2xl font-bold text-gray-900">{selectedGuest.name}</h2>
              <div className="flex flex-col gap-1 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> {selectedGuest.email}</span>
                <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> {selectedGuest.phone}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
                <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm font-medium self-start sm:self-end">
                    {selectedGuest.totalStays} Estadias
                </span>
                <div className="flex gap-2">
                    <button 
                        onClick={handleDelete}
                        className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-600 px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
                    >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                    </button>
                    <button 
                        onClick={() => openWhatsApp(selectedGuest.phone)}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
                    >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                    </button>
                </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b px-6 overflow-x-auto">
            <button 
                onClick={() => setActiveTab('details')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'details' ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                Detalhes
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'history' ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                Histórico
            </button>
            <button 
                onClick={() => setActiveTab('ai')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'ai' ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Inteligência</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'details' && (
                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Observações do Hóspede</h4>
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-gray-700">
                            {selectedGuest.notes || "Nenhuma observação registrada."}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                            {selectedGuest.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 border flex items-center gap-1">
                                    <Tag className="w-3 h-3" /> {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="space-y-4">
                    {bookings.filter(b => b.guestId === selectedGuest.id).map(booking => {
                        const prop = properties.find(p => p.id === booking.propertyId);
                        return (
                            <div key={booking.id} className="flex flex-col p-4 border rounded-lg hover:shadow-sm transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{prop?.name || 'Propriedade desconhecida'}</h4>
                                        <p className="text-sm text-gray-500">
                                            {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            booking.status === 'Confirmado' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {booking.status}
                                        </span>
                                        <p className="text-sm font-medium mt-1">R$ {booking.totalPrice}</p>
                                    </div>
                                </div>
                                {booking.stayNotes && (
                                    <div className="mt-2 pt-2 border-t text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                        <span className="font-semibold text-gray-700">Obs. da Estadia:</span> {booking.stayNotes}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {bookings.filter(b => b.guestId === selectedGuest.id).length === 0 && (
                        <p className="text-gray-500 text-center py-8">Nenhuma reserva encontrada.</p>
                    )}
                </div>
            )}

            {activeTab === 'ai' && (
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-4 text-sm text-blue-800">
                        <p>A IA utilizará as <strong>Observações da Estadia</strong> da última reserva para personalizar a mensagem, se disponível.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button 
                            onClick={() => handleGenerateMessage('welcome')}
                            disabled={isGenerating}
                            className="flex items-center justify-center gap-2 p-4 border rounded-xl hover:bg-rose-50 hover:border-rose-200 transition-all text-gray-700 hover:text-rose-600"
                        >
                            <MessageSquare className="w-5 h-5" />
                            <span>Email de Boas-vindas</span>
                        </button>
                         <button 
                            onClick={() => handleGenerateMessage('thank_you')}
                            disabled={isGenerating}
                            className="flex items-center justify-center gap-2 p-4 border rounded-xl hover:bg-rose-50 hover:border-rose-200 transition-all text-gray-700 hover:text-rose-600"
                        >
                            <MessageSquare className="w-5 h-5" />
                            <span>Agradecimento Pós-Checkout</span>
                        </button>
                         <button 
                            onClick={() => handleGenerateMessage('offer')}
                            disabled={isGenerating}
                            className="flex items-center justify-center gap-2 p-4 border rounded-xl hover:bg-rose-50 hover:border-rose-200 transition-all text-gray-700 hover:text-rose-600"
                        >
                            <Tag className="w-5 h-5" />
                            <span>Oferta de Retorno</span>
                        </button>
                         <button 
                            onClick={handleAnalyzeStrategy}
                            disabled={isGenerating}
                            className="flex items-center justify-center gap-2 p-4 border rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-all text-gray-700 hover:text-purple-600"
                        >
                            <Sparkles className="w-5 h-5" />
                            <span>Analisar Estratégia</span>
                        </button>
                    </div>

                    {isGenerating && (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-2"></div>
                            <p className="text-gray-500">A Inteligência Artificial está trabalhando...</p>
                        </div>
                    )}

                    {!isGenerating && aiResponse && (
                        <div className="bg-gray-50 border rounded-xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-rose-500" /> Resultado Gerado
                                </h3>
                                <button 
                                    onClick={() => navigator.clipboard.writeText(aiResponse)}
                                    className="flex items-center gap-1 text-xs text-rose-600 hover:underline"
                                >
                                    <Copy className="w-3 h-3" /> Copiar Texto
                                </button>
                            </div>
                            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap font-sans bg-white p-4 rounded border mb-4">
                                {aiResponse}
                            </div>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => openWhatsApp(selectedGuest.phone, aiResponse)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Enviar no WhatsApp
                                </button>
                                <button 
                                    onClick={() => openEmail(selectedGuest.email, aiResponse)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
                                >
                                    <Send className="w-4 h-4" />
                                    Enviar por Email
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full md:w-2/3 flex items-center justify-center flex-col text-gray-400 p-8">
          <Users className="w-16 h-16 mb-4 opacity-20" />
          <p>Selecione um hóspede para ver detalhes e usar a IA.</p>
        </div>
      )}

      {/* Add Guest Modal */}
      {isAddModalOpen && (
          <div className="absolute inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">Novo Hóspede</h3>
                    <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                        <input 
                            required
                            type="text" 
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                            value={newGuestData.name}
                            onChange={e => setNewGuestData({...newGuestData, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                            required
                            type="email" 
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                            value={newGuestData.email}
                            onChange={e => setNewGuestData({...newGuestData, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                        <input 
                            required
                            type="tel" 
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                            value={newGuestData.phone}
                            onChange={e => setNewGuestData({...newGuestData, phone: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Observações do Hóspede (Gerais)</label>
                        <textarea 
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                            value={newGuestData.notes}
                            onChange={e => setNewGuestData({...newGuestData, notes: e.target.value})}
                            rows={2}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separadas por vírgula)</label>
                        <input 
                            type="text" 
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                            value={newGuestData.tags}
                            onChange={e => setNewGuestData({...newGuestData, tags: e.target.value})}
                            placeholder="VIP, Negócios, Família"
                        />
                    </div>
                    <div className="pt-2 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsAddModalOpen(false)}
                            className="flex-1 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 py-2 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 transition"
                        >
                            Salvar Hóspede
                        </button>
                    </div>
                </form>
            </div>
          </div>
      )}
    </div>
  );
};

export default CRMModule;