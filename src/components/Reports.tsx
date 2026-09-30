import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Download, DollarSign, TrendingUp, Package, Printer, Calendar } from 'lucide-react';

export default function Reports() {
  const { printers, toners, movements } = useApp();

  const totalInventoryValue = toners.reduce((sum, t) => sum + t.stock * t.unitPrice, 0);
  const totalDelivered = movements.filter(m => m.type === 'delivery').reduce((sum, m) => sum + m.quantity, 0);
  const totalRestocked = movements.filter(m => m.type === 'restock').reduce((sum, m) => sum + m.quantity, 0);
  const totalDisposed = movements.filter(m => m.type === 'disposal').reduce((sum, m) => sum + m.quantity, 0);

  const deptUsage = printers.reduce((acc, p) => {
    const dept = p.department;
    if (!acc[dept]) acc[dept] = { name: dept, pages: 0, printers: 0 };
    acc[dept].pages += p.totalPages;
    acc[dept].printers += 1;
    return acc;
  }, {} as Record<string, { name: string; pages: number; printers: number }>);
  const deptData = Object.values(deptUsage).sort((a, b) => b.pages - a.pages);

  const monthlySpending = [
    { month: 'Ago', gasto: 420, entregas: 3 }, { month: 'Sep', gasto: 580, entregas: 5 },
    { month: 'Oct', gasto: 310, entregas: 2 }, { month: 'Nov', gasto: 690, entregas: 6 },
    { month: 'Dic', gasto: 850, entregas: 7 }, { month: 'Ene', gasto: 520, entregas: 4 },
  ];

  const brandData = toners.reduce((acc, t) => {
    const existing = acc.find(a => a.name === t.brand);
    if (existing) existing.value += t.stock;
    else acc.push({ name: t.brand, value: t.stock });
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  const printerEfficiency = printers.filter(p => p.status === 'active').map(p => ({
    name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
    pages: p.totalPages, dept: p.department,
  })).sort((a, b) => b.pages - a.pages).slice(0, 6);

  const handleExport = () => {
    const report = {
      fecha: new Date().toISOString(),
      resumen: {
        totalImpresoras: printers.length, impresorasActivas: printers.filter(p => p.status === 'active').length,
        totalToners: toners.length, stockTotal: toners.reduce((s, t) => s + t.stock, 0),
        valorInventario: totalInventoryValue, movimientosTotales: movements.length,
        entregas: totalDelivered, reposiciones: totalRestocked, desechos: totalDisposed,
      },
      impresoras: printers, inventario: toners, movimientos: movements,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-toner-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={handleExport} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm"><Download size={16} /> Exportar Reporte</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg"><div className="flex items-center justify-between"><div><p className="text-blue-100 text-xs font-medium">Valor Inventario</p><p className="text-2xl font-bold mt-1">${totalInventoryValue.toFixed(0)}</p></div><DollarSign size={28} className="text-blue-200" /></div></div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg"><div className="flex items-center justify-between"><div><p className="text-emerald-100 text-xs font-medium">Entregas Realizadas</p><p className="text-2xl font-bold mt-1">{totalDelivered}</p></div><TrendingUp size={28} className="text-emerald-200" /></div></div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg"><div className="flex items-center justify-between"><div><p className="text-purple-100 text-xs font-medium">Reposiciones</p><p className="text-2xl font-bold mt-1">{totalRestocked}</p></div><Package size={28} className="text-purple-200" /></div></div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white shadow-lg"><div className="flex items-center justify-between"><div><p className="text-amber-100 text-xs font-medium">Total Movimientos</p><p className="text-2xl font-bold mt-1">{movements.length}</p></div><Calendar size={28} className="text-amber-200" /></div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><DollarSign size={18} className="text-emerald-500" /> Gasto Mensual en Tóner</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlySpending}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} /><Tooltip formatter={(value: number) => [`$${value}`, 'Gasto']} /><Area type="monotone" dataKey="gasto" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} /></AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Package size={18} className="text-blue-500" /> Distribución por Marca</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart><Pie data={brandData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>{brandData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Printer size={18} className="text-purple-500" /> Uso por Departamento</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deptData} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis type="number" fontSize={12} /><YAxis dataKey="name" type="category" fontSize={11} width={100} /><Tooltip /><Bar dataKey="pages" fill="#8b5cf6" radius={[0, 4, 4, 0]} /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-amber-500" /> Eficiencia de Impresoras</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={printerEfficiency}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="name" fontSize={10} angle={-20} textAnchor="end" height={60} /><YAxis fontSize={12} /><Tooltip /><Bar dataKey="pages" fill="#f59e0b" radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}