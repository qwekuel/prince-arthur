import { Fine } from '../types';
import { Badge } from '@/components/ui/badge';

interface FineListProps {
  fines: Fine[];
  onPay: (fine: Fine) => void;
  selectedId?: string;
}

export function FineList({ fines, onPay, selectedId }: FineListProps) {
  if (fines.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
        <p className="text-xs font-bold uppercase tracking-widest">No citation records found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-3">Citation ID</th>
            <th className="px-4 py-3">Offense Type</th>
            <th className="px-4 py-3">Date & Time</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {fines.map((fine) => (
            <tr 
              key={fine.id} 
              className={`
                hover:bg-slate-50 transition-colors cursor-pointer group
                ${selectedId === fine.id ? 'bg-blue-50/50' : ''}
                ${fine.status === 'unpaid' ? 'bg-red-50/10' : ''}
              `}
              onClick={() => onPay(fine)}
            >
              <td className="px-4 py-4 text-[11px] font-mono font-bold text-slate-600">#{fine.id}</td>
              <td className="px-4 py-4">
                <div className="text-[11px] font-bold text-slate-900 leading-tight">{fine.offense}</div>
                <div className="text-[9px] text-slate-400 font-medium uppercase tracking-tight mt-0.5">Code: TRAFF-X</div>
              </td>
              <td className="px-4 py-4 text-[11px] text-slate-600 font-mono">{fine.date}</td>
              <td className="px-4 py-4 text-[11px] text-slate-600 max-w-[150px] truncate">{fine.location}</td>
              <td className="px-4 py-4 text-[11px] font-black text-slate-900 text-right">GHS {fine.amount.toFixed(2)}</td>
              <td className="px-4 py-4">
                <Badge 
                  variant="outline" 
                  className={`
                    text-[9px] font-black uppercase tracking-wider py-0 px-1.5 h-4 border-2
                    ${fine.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}
                  `}
                >
                  {fine.status}
                </Badge>
              </td>
              <td className="px-4 py-4 text-center">
                 <div className={`w-1.5 h-1.5 rounded-full ${selectedId === fine.id ? 'bg-blue-600' : 'bg-transparent'}`}></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
