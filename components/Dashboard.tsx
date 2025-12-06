import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, Calendar, Users, Star } from 'lucide-react';
import { Booking, BookingStatus, Guest } from '../types';

interface DashboardProps {
  bookings: Booking[];
  guests: Guest[];
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType; color: string }> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ bookings, guests }) => {
  const stats = useMemo(() => {
    const totalRevenue = bookings
      .filter(b => b.status === BookingStatus.Completed || b.status === BookingStatus.Confirmed)
      .reduce((acc, curr) => acc + curr.totalPrice, 0);

    const activeBookings = bookings.filter(b => b.status === BookingStatus.Confirmed).length;
    const totalGuests = guests.length;

    // Chart Data: Revenue by Month (Simplified mock logic based on booking dates)
    const revenueByMonth = bookings.reduce((acc: any, curr) => {
      const month = new Date(curr.startDate).toLocaleString('default', { month: 'short' });
      const existing = acc.find((d: any) => d.name === month);
      if (existing) {
        existing.amount += curr.totalPrice;
      } else {
        acc.push({ name: month, amount: curr.totalPrice });
      }
      return acc;
    }, []);
    
    // Sort roughly by date (mock sort for demo)
    revenueByMonth.sort((a: any, b: any) => a.name.localeCompare(b.name));

    return { totalRevenue, activeBookings, totalGuests, revenueByMonth };
  }, [bookings, guests]);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
        <p className="text-gray-500">Acompanhe o desempenho das suas locações.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Receita Total" 
          value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR')}`} 
          icon={DollarSign} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Reservas Ativas" 
          value={stats.activeBookings.toString()} 
          icon={Calendar} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Total de Hóspedes" 
          value={stats.totalGuests.toString()} 
          icon={Users} 
          color="bg-rose-500" 
        />
        <StatCard 
          title="Avaliação Média" 
          value="4.9" 
          icon={Star} 
          color="bg-amber-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Receita por Mês</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `R$${value}`} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: number) => [`R$ ${value}`, 'Receita']}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                   {stats.revenueByMonth.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill="#f43f5e" />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Próximos Check-ins</h3>
          <div className="space-y-4">
            {bookings
              .filter(b => new Date(b.startDate) >= new Date()) // Future bookings
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .slice(0, 4)
              .map(booking => {
                const guest = guests.find(g => g.id === booking.guestId);
                return (
                  <div key={booking.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                      {guest?.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{guest?.name}</p>
                      <p className="text-sm text-gray-500">{new Date(booking.startDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                );
              })}
              {bookings.filter(b => new Date(b.startDate) >= new Date()).length === 0 && (
                <p className="text-gray-500 text-sm">Nenhum check-in próximo.</p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
