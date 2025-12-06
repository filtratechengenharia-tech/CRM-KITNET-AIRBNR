
import React, { useState, useEffect } from 'react';
import { Kitnet, Tenant, RentPayment, PaymentStatus, MaintenanceRecord } from '../types';
import { Home, User, Calendar, CheckCircle, TrendingUp, LogOut, FileSignature, Wrench, X, Save, Printer, Plus, Trash2 } from 'lucide-react';

interface LongTermRentalsProps {
  kitnets: Kitnet[];
  tenants: Tenant[];
  payments: RentPayment[];
  maintenance: MaintenanceRecord[];
  onPaymentUpdate: (paymentId: string, status: PaymentStatus) => void;
  onUpdateTenant: (tenant: Tenant) => void;
  onUpdateKitnet: (kitnet: Kitnet) => void;
  onAddKitnet: (k: Omit<Kitnet, 'id'>) => void;
  onDeleteKitnet: (id: string) => void;
  onAddMaintenance: (m: Omit<MaintenanceRecord, 'id'>) => void;
  onAddTenant: (t: Omit<Tenant, 'id'>) => Tenant;
}

const LongTermRentals: React.FC<LongTermRentalsProps> = ({ 
    kitnets, tenants, payments, maintenance, 
    onPaymentUpdate, onUpdateTenant, onUpdateKitnet, onAddKitnet, onDeleteKitnet, onAddMaintenance, onAddTenant 
}) => {
  const [selectedKitnet, setSelectedKitnet] = useState<Kitnet | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<RentPayment | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'financial' | 'actions' | 'maintenance'>('info');
  
  // Modals
  const [showAddKitnetModal, setShowAddKitnetModal] = useState(false);
  const [showAddMaintenanceModal, setShowAddMaintenanceModal] = useState(false);
  const [showNewContractModal, setShowNewContractModal] = useState(false);
  
  // Actions
  const [showIgpmModal, setShowIgpmModal] = useState(false);
  const [showDistratoModal, setShowDistratoModal] = useState(false);
  const [igpmPercent, setIgpmPercent] = useState('');
  const [igpmResult, setIgpmResult] = useState<string | null>(null);
  const [observations, setObservations] = useState('');

  // Forms
  const [newKitnetData, setNewKitnetData] = useState({ name: '', address: '', rentValue: '' });
  const [newMaintenanceData, setNewMaintenanceData] = useState({ description: '', cost: '', date: '' });
  const [newContractData, setNewContractData] = useState({ name: '', cpf: '', phone: '', email: '', entryDate: '', notes: '' });

  const selectedTenant = selectedKitnet?.tenantId ? tenants.find(t => t.id === selectedKitnet.tenantId) : null;
  const kitnetPayments = selectedKitnet ? payments.filter(p => p.kitnetId === selectedKitnet.id).sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()) : [];
  
  const maintenanceList = maintenance.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  useEffect(() => {
    if (selectedTenant) {
        setObservations(selectedTenant.notes || '');
    }
  }, [selectedTenant]);

  const getKitnetStatusColor = (status: string) => {
    switch (status) {
      case 'Occupied': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Vacant': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Maintenance': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.Paid: return 'text-emerald-600 bg-emerald-50';
      case PaymentStatus.Pending: return 'text-amber-600 bg-amber-50';
      case PaymentStatus.Late: return 'text-red-600 bg-red-50';
      default: return 'text-gray-600';
    }
  };

  const handlePrint = () => {
      window.print();
  };

  const handleSaveNotes = () => {
      if (selectedTenant) {
          onUpdateTenant({ ...selectedTenant, notes: observations });
          alert('Observações salvas!');
      }
  };

  const handleCalculateIgpm = () => {
      if (!selectedKitnet || !igpmPercent) return;
      const currentRent = selectedKitnet.rentValue;
      const percent = parseFloat(igpmPercent.replace(',', '.'));
      const increase = currentRent * (percent / 100);
      const newRent = currentRent + increase;
      
      const message = `Olá ${selectedTenant?.name || 'Inquilino'}, informamos que o aluguel será reajustado em ${percent}% (índice IGPM). O novo valor será R$ ${newRent.toFixed(2)}, a partir do próximo vencimento.`;
      
      setIgpmResult(message);
  };

  const handleEndContract = () => {
      if (!selectedKitnet || !selectedTenant) return;
      
      if (window.confirm(`Tem certeza que deseja encerrar o contrato de ${selectedTenant.name}? O inquilino será movido para o histórico e a Kitnet ficará Vaga.`)) {
          // 1. Update Tenant
          const updatedTenant: Tenant = {
              ...selectedTenant,
              status: 'Past',
              endDate: new Date().toISOString().split('T')[0]
          };
          onUpdateTenant(updatedTenant);

          // 2. Free up Kitnet
          const updatedKitnet: Kitnet = {
              ...selectedKitnet,
              status: 'Vacant',
              tenantId: undefined
          };
          onUpdateKitnet(updatedKitnet);
          
          setSelectedKitnet(updatedKitnet);
          setActiveTab('info');
      }
  };

  const handleAddKitnetSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onAddKitnet({
          name: newKitnetData.name,
          address: newKitnetData.address,
          rentValue: Number(newKitnetData.rentValue),
          status: 'Vacant'
      });
      setShowAddKitnetModal(false);
      setNewKitnetData({ name: '', address: '', rentValue: '' });
  };

  const handleAddMaintenanceSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onAddMaintenance({
          description: newMaintenanceData.description,
          cost: Number(newMaintenanceData.cost),
          date: newMaintenanceData.date,
          status: 'Completed' // Defaulting to completed for simple expense tracking
      });
      setShowAddMaintenanceModal(false);
      setNewMaintenanceData({ description: '', cost: '', date: '' });
  };

  const handleNewContractSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedKitnet) return;

      // 1. Create Tenant
      const newTenant = onAddTenant({
          name: newContractData.name,
          cpf: newContractData.cpf,
          email: newContractData.email,
          phone: newContractData.phone,
          entryDate: newContractData.entryDate,
          status: 'Active',
          notes: newContractData.notes
      });

      // 2. Update Kitnet
      const updatedKitnet = {
          ...selectedKitnet,
          status: 'Occupied' as const,
          tenantId: newTenant.id
      };
      onUpdateKitnet(updatedKitnet);
      setSelectedKitnet(updatedKitnet);
      
      setShowNewContractModal(false);
      setNewContractData({ name: '', cpf: '', phone: '', email: '', entryDate: '', notes: '' });
      setActiveTab('info');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Sidebar List */}
      <div className="w-full lg:w-1/3 flex flex-col">
        <div className="flex justify-between items-center mb-4 pr-2">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Home className="w-5 h-5 text-indigo-600" />
                Unidades
            </h2>
            <button 
                onClick={() => setShowAddKitnetModal(true)}
                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700"
                title="Adicionar Kitnet"
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>
        
        <div className="overflow-y-auto pr-2 flex-1 space-y-3">
            {kitnets.map(kitnet => {
                const tenant = tenants.find(t => t.id === kitnet.tenantId);
                return (
                    <div 
                        key={kitnet.id}
                        onClick={() => {
                            setSelectedKitnet(kitnet);
                            setActiveTab('info');
                        }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md relative group ${
                            selectedKitnet?.id === kitnet.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 bg-white'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-gray-900">{kitnet.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getKitnetStatusColor(kitnet.status)}`}>
                                {kitnet.status === 'Occupied' ? 'Ocupada' : kitnet.status === 'Vacant' ? 'Vaga' : 'Manutenção'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{kitnet.address}</p>
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-gray-900">R$ {kitnet.rentValue}</span>
                            {tenant && (
                                <span className="flex items-center gap-1 text-gray-600">
                                    <User className="w-3 h-3" /> {tenant.name}
                                </span>
                            )}
                        </div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                if(window.confirm('Excluir esta Kitnet?')) onDeleteKitnet(kitnet.id);
                            }}
                            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 transition"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>

        {/* Global Maintenance Button in Sidebar */}
        <button 
            onClick={() => { setSelectedKitnet(null); setActiveTab('maintenance'); }}
            className={`mt-4 p-4 rounded-xl border-2 flex items-center justify-center gap-2 font-medium transition-colors ${activeTab === 'maintenance' && !selectedKitnet ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
        >
            <Wrench className="w-5 h-5" />
            Manutenção Predial
        </button>
      </div>

      {/* Main Content Area */}
      <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        {activeTab === 'maintenance' && !selectedKitnet ? (
             <div className="flex flex-col h-full">
                <div className="p-6 border-b bg-amber-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-amber-900">Manutenção Predial</h2>
                        <p className="text-amber-700">Controle de gastos com áreas comuns e reformas.</p>
                    </div>
                    <button 
                        onClick={() => setShowAddMaintenanceModal(true)}
                        className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Adicionar Gasto
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-3 font-medium text-gray-600">Data</th>
                                <th className="p-3 font-medium text-gray-600">Descrição</th>
                                <th className="p-3 font-medium text-gray-600">Valor</th>
                                <th className="p-3 font-medium text-gray-600">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {maintenanceList.map(m => (
                                <tr key={m.id}>
                                    <td className="p-3 text-gray-900">{new Date(m.date).toLocaleDateString()}</td>
                                    <td className="p-3 text-gray-900">{m.description}</td>
                                    <td className="p-3 font-bold text-gray-900">R$ {m.cost.toFixed(2)}</td>
                                    <td className="p-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Concluído</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg text-right">
                        <p className="text-gray-500">Total Gasto em Manutenção</p>
                        <p className="text-2xl font-bold text-gray-900">R$ {maintenanceList.reduce((acc, curr) => acc + curr.cost, 0).toFixed(2)}</p>
                    </div>
                </div>
             </div>
        ) : selectedKitnet ? (
            <>
                {/* Header */}
                <div className="p-6 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedKitnet.name}</h2>
                        <p className="text-gray-500">{selectedKitnet.address}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Aluguel Base</p>
                        <p className="text-2xl font-bold text-indigo-600">R$ {selectedKitnet.rentValue}</p>
                    </div>
                </div>

                {selectedTenant ? (
                    <>
                        {/* Tabs */}
                        <div className="flex border-b px-6 overflow-x-auto">
                            <button 
                                onClick={() => setActiveTab('info')}
                                className={`py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'info' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Inquilino
                            </button>
                            <button 
                                onClick={() => setActiveTab('financial')}
                                className={`py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'financial' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Financeiro
                            </button>
                            <button 
                                onClick={() => setActiveTab('actions')}
                                className={`py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'actions' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Contrato & Ações
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {activeTab === 'info' && (
                                <div className="space-y-6">
                                    <div className="bg-white border rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><p className="text-xs text-gray-500 uppercase">Nome</p><p className="font-medium">{selectedTenant.name}</p></div>
                                        <div><p className="text-xs text-gray-500 uppercase">CPF</p><p className="font-medium">{selectedTenant.cpf}</p></div>
                                        <div><p className="text-xs text-gray-500 uppercase">Email</p><p className="font-medium">{selectedTenant.email}</p></div>
                                        <div><p className="text-xs text-gray-500 uppercase">Telefone</p><p className="font-medium">{selectedTenant.phone}</p></div>
                                        <div><p className="text-xs text-gray-500 uppercase">Entrada</p><p className="font-medium">{new Date(selectedTenant.entryDate).toLocaleDateString()}</p></div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-bold text-gray-700">Observações</label>
                                            <button onClick={handleSaveNotes} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors"><Save className="w-3 h-3" /> Salvar</button>
                                        </div>
                                        <textarea className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" rows={5} value={observations} onChange={(e) => setObservations(e.target.value)} placeholder="Ex: Inquilino solicitou reparo..." />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'financial' && (
                                <div>
                                    <div className="bg-white border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                                <tr><th className="p-3">Vencimento</th><th className="p-3">Valor</th><th className="p-3">Status</th><th className="p-3">Ações</th></tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {kitnetPayments.map(payment => (
                                                    <tr key={payment.id} className="hover:bg-gray-50">
                                                        <td className="p-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /> {new Date(payment.dueDate).toLocaleDateString()}</td>
                                                        <td className="p-3 font-medium">R$ {payment.amount}</td>
                                                        <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>{payment.status === PaymentStatus.Paid ? 'Pago' : payment.status === PaymentStatus.Late ? 'Atrasado' : 'Pendente'}</span></td>
                                                        <td className="p-3 flex gap-2">
                                                            {payment.status !== PaymentStatus.Paid ? (
                                                                <button onClick={() => onPaymentUpdate(payment.id, PaymentStatus.Paid)} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"><CheckCircle className="w-4 h-4" /></button>
                                                            ) : (
                                                                <button onClick={() => setShowReceiptModal(payment)} className="text-gray-600 hover:bg-gray-100 p-1 rounded"><Printer className="w-4 h-4" /></button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {kitnetPayments.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-gray-500">Nenhum registro.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'actions' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 border rounded-lg">
                                            <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-blue-500" /> Reajuste IGPM</h4>
                                            <button onClick={() => setShowIgpmModal(true)} className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm">Calcular</button>
                                        </div>
                                        <div className="p-4 border rounded-lg">
                                            <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2"><FileSignature className="w-4 h-4 text-purple-500" /> Distrato</h4>
                                            <button onClick={() => setShowDistratoModal(true)} className="w-full py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 font-medium text-sm">Gerar Documento</button>
                                        </div>
                                        <div className="p-4 border rounded-lg border-red-100 bg-red-50 col-span-1 md:col-span-2">
                                            <h4 className="font-bold text-red-800 flex items-center gap-2 mb-2"><LogOut className="w-4 h-4" /> Encerrar Contrato</h4>
                                            <button onClick={handleEndContract} className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm">Confirmar Saída</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50 m-6 rounded-xl border border-dashed border-gray-300">
                        <User className="w-12 h-12 mb-3 text-gray-300" />
                        <p className="font-medium">Kitnet Vaga</p>
                        <button 
                            onClick={() => setShowNewContractModal(true)}
                            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                        >
                            <FileSignature className="w-4 h-4" /> Novo Contrato
                        </button>
                    </div>
                )}
            </>
        ) : (
             <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Home className="w-16 h-16 mb-4 opacity-20" />
                <p>Selecione uma unidade ou acesse a Manutenção.</p>
            </div>
        )}
      </div>

      {/* --- MODALS --- */}
      {showReceiptModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold">Recibo</h3>
                    <button onClick={() => setShowReceiptModal(null)}><X className="w-5 h-5"/></button>
                </div>
                <div className="p-8 text-center space-y-4">
                    <h1 className="text-2xl font-bold">R$ {showReceiptModal.amount.toFixed(2)}</h1>
                    <p>Referente a {selectedKitnet?.name}</p>
                    <p className="text-sm text-gray-500">Pago em {new Date().toLocaleDateString()}</p>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end gap-2">
                    <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 text-white rounded flex gap-2"><Printer className="w-4 h-4"/> Imprimir</button>
                </div>
              </div>
          </div>
      )}

      {showIgpmModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl w-full max-w-md p-6">
                <h3 className="font-bold mb-4">Reajuste IGPM</h3>
                <input type="number" className="w-full border p-2 rounded mb-4" placeholder="% IGPM" value={igpmPercent} onChange={e=>setIgpmPercent(e.target.value)} />
                <button onClick={handleCalculateIgpm} className="w-full bg-blue-600 text-white py-2 rounded">Calcular</button>
                {igpmResult && <div className="mt-4 bg-gray-50 p-3 text-sm rounded">{igpmResult}</div>}
                <button onClick={() => setShowIgpmModal(false)} className="mt-4 text-gray-500 w-full">Fechar</button>
              </div>
          </div>
      )}
      
      {showDistratoModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl w-full max-w-2xl p-8 overflow-y-auto max-h-[90vh]">
                 <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold uppercase">Termo de Distrato</h2><button onClick={()=>setShowDistratoModal(false)}><X/></button></div>
                 <div className="prose prose-sm">
                    <p>Encerramento do contrato de locação da unidade {selectedKitnet?.name}, devolvendo-se as chaves nesta data.</p>
                 </div>
                 <button onClick={handlePrint} className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded flex gap-2"><Printer className="w-4 h-4"/> Imprimir</button>
              </div>
          </div>
      )}

      {/* Add Kitnet Modal */}
      {showAddKitnetModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6">
                <h3 className="font-bold mb-4">Adicionar Kitnet</h3>
                <form onSubmit={handleAddKitnetSubmit} className="space-y-3">
                    <input required className="w-full border p-2 rounded" placeholder="Nome (Ex: Kitnet 10)" value={newKitnetData.name} onChange={e => setNewKitnetData({...newKitnetData, name: e.target.value})} />
                    <input required className="w-full border p-2 rounded" placeholder="Endereço" value={newKitnetData.address} onChange={e => setNewKitnetData({...newKitnetData, address: e.target.value})} />
                    <input required type="number" className="w-full border p-2 rounded" placeholder="Valor Aluguel" value={newKitnetData.rentValue} onChange={e => setNewKitnetData({...newKitnetData, rentValue: e.target.value})} />
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={() => setShowAddKitnetModal(false)} className="flex-1 border p-2 rounded">Cancelar</button>
                        <button type="submit" className="flex-1 bg-indigo-600 text-white p-2 rounded">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Add Maintenance Modal */}
      {showAddMaintenanceModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6">
                <h3 className="font-bold mb-4">Novo Gasto de Manutenção</h3>
                <form onSubmit={handleAddMaintenanceSubmit} className="space-y-3">
                    <input required className="w-full border p-2 rounded" placeholder="Descrição (Ex: Pintura)" value={newMaintenanceData.description} onChange={e => setNewMaintenanceData({...newMaintenanceData, description: e.target.value})} />
                    <input required type="number" className="w-full border p-2 rounded" placeholder="Valor (R$)" value={newMaintenanceData.cost} onChange={e => setNewMaintenanceData({...newMaintenanceData, cost: e.target.value})} />
                    <input required type="date" className="w-full border p-2 rounded" value={newMaintenanceData.date} onChange={e => setNewMaintenanceData({...newMaintenanceData, date: e.target.value})} />
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={() => setShowAddMaintenanceModal(false)} className="flex-1 border p-2 rounded">Cancelar</button>
                        <button type="submit" className="flex-1 bg-amber-600 text-white p-2 rounded">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* New Contract Modal */}
      {showNewContractModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">Novo Contrato de Locação</h3>
                    <button onClick={() => setShowNewContractModal(false)} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleNewContractSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Inquilino</label>
                        <input required type="text" className="w-full border rounded-lg px-3 py-2" value={newContractData.name} onChange={e => setNewContractData({...newContractData, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                            <input required type="text" className="w-full border rounded-lg px-3 py-2" value={newContractData.cpf} onChange={e => setNewContractData({...newContractData, cpf: e.target.value})} placeholder="000.000.000-00" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                            <input required type="text" className="w-full border rounded-lg px-3 py-2" value={newContractData.phone} onChange={e => setNewContractData({...newContractData, phone: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" className="w-full border rounded-lg px-3 py-2" value={newContractData.email} onChange={e => setNewContractData({...newContractData, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Entrada</label>
                        <input required type="date" className="w-full border rounded-lg px-3 py-2" value={newContractData.entryDate} onChange={e => setNewContractData({...newContractData, entryDate: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Observações Iniciais</label>
                        <textarea className="w-full border rounded-lg px-3 py-2" value={newContractData.notes} onChange={e => setNewContractData({...newContractData, notes: e.target.value})} rows={2} />
                    </div>
                    
                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={() => setShowNewContractModal(false)} className="flex-1 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">Cancelar</button>
                        <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition">Gerar Contrato</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default LongTermRentals;
