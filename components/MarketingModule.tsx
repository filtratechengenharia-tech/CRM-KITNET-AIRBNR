
import React, { useState } from 'react';
import { Guest, Property } from '../types';
import { Megaphone, Instagram, MessageCircle, Copy, Sparkles, Filter, Calendar, Sun, Snowflake, CloudRain, Leaf, Users } from 'lucide-react';
import { GeminiService } from '../services/gemini';

interface MarketingModuleProps {
  guests: Guest[];
  properties: Property[];
}

// Dados do Calendário 2026
const CALENDAR_2026 = [
    { 
        season: 'Verão', icon: Sun, color: 'text-orange-500 bg-orange-50',
        events: [
            { date: '01/Jan (Quinta)', name: 'Ano Novo 2026', strategy: 'Pacote de 4 a 5 dias. Foco total em Praia (Preço Máximo).' },
            { date: '25/Jan (Domingo)', name: 'Aniversário de SP', strategy: 'Day-use ou late check-out no domingo para paulistas. Não gera feriadão, mas aumenta procura local.' },
            { date: '17/Fev (Terça)', name: 'Carnaval 2026', strategy: 'Praia: O "Filé Mignon", pacote 5 noites. Campo: Venda como "Refúgio do Barulho" para quem odeia folia.' }
        ]
    },
    { 
        season: 'Outono', icon: Leaf, color: 'text-amber-600 bg-amber-50',
        events: [
            { date: '03/Abr (Sexta)', name: 'Paixão de Cristo', strategy: 'Último suspiro do calor forte na Praia. Feriadão clássico de 3 dias.' },
            { date: '21/Abr (Terça)', name: 'Tiradentes', strategy: 'Possível "enforcamento" da segunda. Pacote 4 dias. Se chover, Campo ganha força.' },
            { date: '01/Mai (Sexta)', name: 'Dia do Trabalho', strategy: 'Início da alta temporada no Campo (frio, lareira, fogueira). Feriadão 3 dias.' }
        ]
    },
    { 
        season: 'Inverno', icon: Snowflake, color: 'text-blue-600 bg-blue-50',
        events: [
            { date: '04/Jun (Quinta)', name: 'Corpus Christi', strategy: 'Super feriadão de 4 dias. Altíssima procura para Campo.' },
            { date: '09/Jul (Quinta)', name: 'Revolução (SP)', strategy: 'Ouro para Paulistas. Só SP para. Anúncios geolocalizados para capital fugindo para o interior.' },
            { date: '07/Set (Segunda)', name: 'Independência', strategy: 'Fim do inverno. Feriadão clássico de 3 dias.' }
        ]
    },
    { 
        season: 'Primavera', icon: CloudRain, color: 'text-pink-600 bg-pink-50',
        events: [
            { date: '12/Out (Segunda)', name: 'N. Sra. Aparecida', strategy: 'Dia das Crianças. Destaque playground e piscina infantil nas fotos de capa.' },
            { date: '02/Nov (Segunda)', name: 'Finados', strategy: 'Feriadão Clássico de 3 dias. Praia começa a aquecer.' },
            { date: '20/Nov (Sexta)', name: 'Consciência Negra', strategy: 'Feriado Nacional. O "esquenta" para o Verão. Teste preços de alta temporada na Praia.' }
        ]
    }
];

const MarketingModule: React.FC<MarketingModuleProps> = ({ guests, properties }) => {
  const [activeTab, setActiveTab] = useState<'funnel' | 'social'>('funnel');
  
  // Funnel State
  const [selectedOpportunity, setSelectedOpportunity] = useState<{name: string, date: string, strategy: string} | null>(null);
  const [propertyFocus, setPropertyFocus] = useState<'Praia' | 'Campo'>('Praia');
  const [campaignOffer, setCampaignOffer] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedGuestForFunnel, setSelectedGuestForFunnel] = useState<Guest | null>(null);
  const [isGenericMessage, setIsGenericMessage] = useState(false);

  // Social State
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [socialOccasion, setSocialOccasion] = useState('');
  const [socialContent, setSocialContent] = useState<string | null>(null);

  const funnelGuests = guests.filter(g => g.totalStays > 0); 

  const handleGenerateCampaign = async () => {
      if ((!selectedGuestForFunnel && !isGenericMessage) || !selectedOpportunity) return;
      setIsGenerating(true);
      
      const guestName = isGenericMessage ? 'GENERIC_TEMPLATE' : selectedGuestForFunnel?.name || '';

      const msg = await GeminiService.generateCampaignMessage(
          guestName, 
          `${selectedOpportunity.name} (${selectedOpportunity.date})`, 
          campaignOffer,
          selectedOpportunity.strategy,
          propertyFocus
      );
      
      setGeneratedMessage(msg);
      setIsGenerating(false);
  };

  const handleGenerateSocial = async () => {
      const prop = properties.find(p => p.id === selectedPropertyId);
      if (!prop || !socialOccasion) return;
      
      setIsGenerating(true);
      const content = await GeminiService.generateInstagramPost(prop, socialOccasion);
      setSocialContent(content);
      setIsGenerating(false);
  };

  const openWhatsApp = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Marketing & Estratégia</h2>

      {/* Tabs */}
      <div className="flex border-b bg-white rounded-t-xl overflow-hidden">
         <button 
            onClick={() => setActiveTab('funnel')}
            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'funnel' ? 'border-rose-500 text-rose-600 bg-rose-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
            <Filter className="w-4 h-4" /> Funil de Revenda 2026
        </button>
        <button 
            onClick={() => setActiveTab('social')}
            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'social' ? 'border-rose-500 text-rose-600 bg-rose-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
            <Instagram className="w-4 h-4" /> Conteúdo para Redes
        </button>
      </div>

      <div className="bg-white rounded-b-xl shadow-sm border border-t-0 p-6 min-h-[500px]">
        {activeTab === 'funnel' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        O Grande Calendário 2026
                    </h3>
                    
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {CALENDAR_2026.map((season) => (
                            <div key={season.season} className="border rounded-lg overflow-hidden">
                                <div className={`px-4 py-2 font-bold flex items-center gap-2 ${season.color}`}>
                                    <season.icon className="w-4 h-4" /> {season.season}
                                </div>
                                <div className="divide-y">
                                    {season.events.map((evt, idx) => (
                                        <div 
                                            key={idx}
                                            onClick={() => {
                                                setSelectedOpportunity(evt);
                                                setGeneratedMessage(null);
                                            }}
                                            className={`p-3 cursor-pointer hover:bg-gray-50 transition text-sm ${selectedOpportunity?.name === evt.name ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''}`}
                                        >
                                            <div className="flex justify-between font-medium text-gray-800">
                                                <span>{evt.name}</span>
                                                <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border">{evt.date}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Guest Selection */}
                    <div className="bg-white border rounded-xl p-4">
                        <h4 className="font-bold text-gray-700 mb-2">1. Selecione o Destinatário</h4>
                        
                        <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded border">
                             <input 
                                type="checkbox" 
                                id="genericMsg" 
                                checked={isGenericMessage} 
                                onChange={(e) => {
                                    setIsGenericMessage(e.target.checked);
                                    if(e.target.checked) setSelectedGuestForFunnel(null);
                                }}
                                className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                             />
                             <label htmlFor="genericMsg" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-500" />
                                Gerar Modelo Geral (Sem Hóspede Específico)
                             </label>
                        </div>

                        {!isGenericMessage && (
                            <select 
                                className="w-full border rounded-lg p-2"
                                onChange={(e) => {
                                    const guest = guests.find(g => g.id === e.target.value);
                                    setSelectedGuestForFunnel(guest || null);
                                }}
                                value={selectedGuestForFunnel?.id || ''}
                            >
                                <option value="">-- Escolha um hóspede antigo --</option>
                                {funnelGuests.map(g => (
                                    <option key={g.id} value={g.id}>{g.name} ({g.totalStays} estadias)</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Configuration & Generation */}
                    <div className="bg-gray-50 p-6 rounded-xl border flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">2. Configurar Campanha</h3>
                        
                        {!selectedOpportunity ? (
                            <div className="text-center text-gray-400 py-4 flex-1 flex flex-col items-center justify-center">
                                <Megaphone className="w-10 h-10 mb-2 opacity-20" />
                                <p>Selecione uma data no calendário ao lado.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-indigo-100 border-l-4 border-indigo-500 p-3 rounded text-sm text-indigo-900">
                                    <p className="font-bold flex items-center gap-2"><Sparkles className="w-3 h-3"/> Pulo do Gato (Estratégia):</p>
                                    <p className="mt-1">{selectedOpportunity.strategy}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Foco do seu Imóvel</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="focus" checked={propertyFocus === 'Praia'} onChange={() => setPropertyFocus('Praia')} className="text-indigo-600" />
                                            <span>Praia 🏖️</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="focus" checked={propertyFocus === 'Campo'} onChange={() => setPropertyFocus('Campo')} className="text-indigo-600" />
                                            <span>Campo 🏡</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Oferta (Opcional)</label>
                                    <input 
                                        type="text" 
                                        className="w-full border rounded-lg p-2"
                                        value={campaignOffer}
                                        onChange={e => setCampaignOffer(e.target.value)}
                                        placeholder="Ex: 5% off, Late checkout grátis..."
                                    />
                                </div>

                                <button 
                                    onClick={handleGenerateCampaign}
                                    disabled={isGenerating || (!selectedGuestForFunnel && !isGenericMessage)}
                                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isGenerating ? 'Criando...' : <><Sparkles className="w-4 h-4" /> Gerar Mensagem Estratégica</>}
                                </button>

                                {generatedMessage && (
                                    <div className="mt-4 bg-white border p-4 rounded-lg shadow-sm">
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{generatedMessage}</p>
                                        <div className="mt-4 flex gap-2">
                                            <button 
                                                onClick={() => navigator.clipboard.writeText(generatedMessage)}
                                                className="flex-1 py-2 border rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center gap-2"
                                            >
                                                <Copy className="w-4 h-4" /> Copiar
                                            </button>
                                            {!isGenericMessage && selectedGuestForFunnel && (
                                                <button 
                                                    onClick={() => openWhatsApp(selectedGuestForFunnel.phone, generatedMessage)}
                                                    className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm flex items-center justify-center gap-2"
                                                >
                                                    <MessageCircle className="w-4 h-4" /> Enviar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'social' && (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-gray-900">Criador de Posts para Instagram</h3>
                    <p className="text-gray-500">A IA cria a legenda e sugere a foto perfeita baseada na "vibe" do imóvel.</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Selecione a Propriedade</label>
                        <select 
                            className="w-full border rounded-lg p-3"
                            value={selectedPropertyId}
                            onChange={e => setSelectedPropertyId(e.target.value)}
                        >
                            <option value="">-- Escolha um imóvel --</option>
                            {properties.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Qual o foco do post?</label>
                        <input 
                            type="text"
                            className="w-full border rounded-lg p-3"
                            placeholder="Ex: Fim de semana de sol, Feriado chegando, Home office com vista..."
                            value={socialOccasion}
                            onChange={e => setSocialOccasion(e.target.value)}
                        />
                    </div>

                    <button 
                         onClick={handleGenerateSocial}
                         disabled={isGenerating || !selectedPropertyId || !socialOccasion}
                         className="w-full bg-rose-500 text-white py-3 rounded-lg hover:bg-rose-600 flex items-center justify-center gap-2 text-lg font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                         {isGenerating ? 'A IA está criando...' : <><Sparkles className="w-5 h-5" /> Gerar Post Incrível</>}
                    </button>
                </div>

                {socialContent && (
                    <div className="mt-8 border rounded-xl overflow-hidden shadow-lg bg-white">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 text-white text-center font-bold text-sm">
                            Sugestão da IA
                        </div>
                        <div className="p-6 prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
                            {socialContent}
                        </div>
                        <div className="bg-gray-50 p-4 border-t flex justify-end">
                             <button 
                                onClick={() => navigator.clipboard.writeText(socialContent)}
                                className="flex items-center gap-2 text-rose-600 font-medium hover:bg-rose-50 px-4 py-2 rounded-lg transition"
                            >
                                <Copy className="w-4 h-4" /> Copiar Tudo
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default MarketingModule;
