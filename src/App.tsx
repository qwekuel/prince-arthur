import React from 'react';
import { Search, Car, CreditCard, History, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Fine, PaymentDetails } from './types';
import { FineList } from './components/FineList';
import { PaymentWizard } from './components/PaymentWizard';

export default function App() {
  const [plateNumber, setPlateNumber] = React.useState('GV-4482-23');
  const [fines, setFines] = React.useState<Fine[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedFine, setSelectedFine] = React.useState<Fine | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!plateNumber) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/fines/${plateNumber}`);
      const data = await response.json();
      setFines(data);
      if (data.length === 0) {
        toast.info("No active fines found for this vehicle.");
      }
    } catch (error) {
      toast.error("Failed to fetch fines.");
    } finally {
      setLoading(false);
    }
  };

  // Initial search
  React.useEffect(() => {
    handleSearch();
  }, []);

  const handlePay = (fine: Fine) => {
    setSelectedFine(fine);
  };

  const handlePaymentComplete = (reference: string) => {
    toast.success(`Payment successful! Ref: ${reference}`);
    setSelectedFine(null);
    handleSearch(); // Refresh fines
  };

  return (
    <div className="h-screen bg-slate-100 flex flex-col text-slate-800 antialiased overflow-hidden">
      {/* Top Navigation */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-lg italic">TP</div>
          <h1 className="text-lg font-bold tracking-tight uppercase text-slate-900">Transit<span className="text-blue-600">Pay</span> System</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> 
            Network Status: Operational
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-500">DA</div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: User & Vehicle Context */}
        <aside className="w-64 bg-slate-900 text-slate-400 p-5 flex flex-col shrink-0 border-r border-slate-800">
          <div className="mb-8 text-white">
            <div className="text-[10px] uppercase tracking-widest opacity-50 mb-1 font-bold">Linked Driver</div>
            <div className="text-sm font-semibold">Qwekue Lail</div>
            <div className="text-xs opacity-70">License: GHA-9022-88X</div>
          </div>

          <div className="space-y-6 flex-1 overflow-y-auto">
            <div>
              <div className="text-[10px] uppercase tracking-widest opacity-50 mb-3 font-bold">Registration Search</div>
              <form onSubmit={handleSearch} className="relative mb-4">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5" />
                <Input
                  placeholder="PLATE NO."
                  className="pl-8 h-9 text-xs uppercase font-mono bg-slate-800 border-slate-700 text-white placeholder:text-slate-600"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                />
              </form>
              
              <div className="text-[10px] uppercase tracking-widest opacity-50 mb-3 font-bold">My Registered Vehicles</div>
              <div className="space-y-2">
                <div className={`bg-slate-800 p-3 rounded border-l-2 ${plateNumber.toUpperCase() === 'GV-4482-23' ? 'border-blue-500 bg-slate-800' : 'border-transparent opacity-60'} cursor-pointer transition-all hover:bg-slate-700`} onClick={() => { setPlateNumber('GV-4482-23'); handleSearch(); }}>
                  <div className="text-xs text-white font-mono">GV-4482-23</div>
                  <div className="text-[10px]">Toyota Hilux (White)</div>
                </div>
                <div className={`bg-slate-800 p-3 rounded border-l-2 ${plateNumber.toUpperCase() === 'AS-9988-23' ? 'border-blue-500 bg-slate-800' : 'border-transparent opacity-60'} cursor-pointer transition-all hover:bg-slate-700`} onClick={() => { setPlateNumber('AS-9988-23'); handleSearch(); }}>
                  <div className="text-xs text-white font-mono">AS-9988-23</div>
                  <div className="text-[10px]">Kia Morning (Black)</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <div className="text-[10px] uppercase tracking-widest opacity-50 mb-3 font-bold">Stats Overview</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-800 p-2 rounded">
                  <div className="text-xs text-white font-bold">GHS {fines.reduce((acc, f) => acc + (f.status === 'unpaid' ? f.amount : 0), 0)}</div>
                  <div className="text-[9px]">Unpaid Total</div>
                </div>
                <div className="bg-slate-800 p-2 rounded">
                  <div className="text-xs text-white font-bold">12</div>
                  <div className="text-[9px]">Points Left</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-auto border-t border-slate-800 pt-4">
            <div className="text-[10px] opacity-40 italic tracking-tight">System v4.2.1-stable</div>
          </div>
        </aside>

        {/* Main Data Area */}
        <main className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
          {/* Main Area Header */}
          <div className="flex justify-between items-end shrink-0">
             <div className="space-y-1">
                <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Search</h2>
                <div className="flex items-center gap-3">
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight">{plateNumber || "N/A"}</h3>
                   <Badge variant="outline" className="bg-white text-blue-600 border-blue-100 font-bold uppercase py-0 text-[9px]">{fines.length} Citations Found</Badge>
                </div>
             </div>
             <div className="flex gap-2">
                <Button variant="outline" size="sm" className="bg-white text-[10px] font-bold uppercase tracking-wider h-8">
                   <History className="w-3.5 h-3.5 mr-2" /> History
                </Button>
                <Button size="sm" className="bg-blue-600 text-[10px] font-bold uppercase tracking-wider h-8">
                   Download Invoices
                </Button>
             </div>
          </div>

          {/* Pending Citations List */}
          <section className="flex flex-col flex-1 min-h-[300px]">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
              <FineList fines={fines} onPay={handlePay} selectedId={selectedFine?.id} />
            </div>
          </section>

          {/* Bottom History Grid */}
          <section className="shrink-0">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Recent Settlement History</h2>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
                  <div className="text-[9px] text-slate-400 mb-1 font-mono uppercase font-bold">Ref: CP-99212{i}</div>
                  <div className="text-sm font-bold text-slate-900">GHS {(60 * i).toFixed(2)} Paid</div>
                  <div className="text-[10px] text-green-600 font-bold mt-1">Via Mobile Money (MTN)</div>
                  <div className="mt-2 pt-2 border-t border-slate-50 text-[9px] text-slate-400 font-medium">Oct {12 + i}, 2024</div>
                  <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <History className="w-3 h-3 text-blue-300" />
                  </div>
                </div>
              ))}
              <div className="bg-slate-50/50 p-3 rounded-lg border border-dashed border-slate-200 flex items-center justify-center flex-col opacity-50">
                <div className="text-[9px] text-slate-400 uppercase font-black tracking-widest">No earlier records</div>
              </div>
              <div className="bg-slate-50/50 p-3 rounded-lg border border-dashed border-slate-200 flex items-center justify-center flex-col opacity-50">
                <div className="text-[9px] text-slate-400 uppercase font-black tracking-widest">No earlier records</div>
              </div>
            </div>
          </section>
        </main>

        {/* Right: Payment Portal */}
        <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 flex-none relative">
          <AnimatePresence mode="wait">
            {!selectedFine ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex-1 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                   <CreditCard className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-tight">Portal Inactive</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                  Select a pending citation from the list to initiate the Mobile Money settlement process.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="portal"
                initial={{ x: 20, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="flex-1 flex flex-col"
              >
                <PaymentWizard 
                  fine={selectedFine} 
                  onComplete={handlePaymentComplete}
                  onCancel={() => setSelectedFine(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
