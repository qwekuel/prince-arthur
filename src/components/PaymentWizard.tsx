import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Fine } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { ShieldCheck, Phone, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  phoneNumber: z.string().min(10, "Invalid phone number").max(10, "Invalid phone number").regex(/^[0-9]+$/, "Must be numbers only"),
  network: z.enum(['MTN', 'Vodafone', 'AirtelTigo'] as const),
});

interface PaymentWizardProps {
  fine: Fine;
  onComplete: (ref: string) => void;
  onCancel: () => void;
}

export function PaymentWizard({ fine, onComplete, onCancel }: PaymentWizardProps) {
  const [step, setStep] = React.useState<'details' | 'processing' | 'done'>('details');
  const [reference, setReference] = React.useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: '0245550192',
      network: 'MTN',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Check if fine is already paid
    if (fine.status === 'paid') {
      toast.info("This citation is already settled.");
      return;
    }

    setStep('processing');
    try {
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fineId: fine.id,
          amount: fine.amount,
          ...values,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setReference(data.reference);
        setStep('done');
      } else {
        toast.error(data.message);
        setStep('details');
      }
    } catch (error) {
      toast.error("Payment failure.");
      setStep('details');
    }
  }

  if (step === 'processing') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-blue-100 rounded-full animate-pulse"></div>
          <Loader2 className="w-20 h-20 text-blue-600 animate-spin absolute inset-0" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Phone className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Waiting for PIN</h3>
          <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
            A secure prompt has been sent to your device. Please authorize the amount of <b>GHS {fine.amount.toFixed(2)}</b>.
          </p>
        </div>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="flex-1 flex flex-col p-6 space-y-8 animate-in fade-in zoom-in duration-300">
        <div className="bg-green-50 border border-green-100 rounded-xl p-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-white p-3 rounded-full shadow-sm ring-4 ring-green-50">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-green-900 uppercase tracking-widest">Settlement Complete</h3>
            <p className="text-[10px] text-green-700/70 font-medium">Citation #{fine.id} has been cleared from your records.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-3">
             <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Receipt Ref</span>
                <span className="text-slate-900 font-mono">{reference}</span>
             </div>
             <Separator />
             <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Amount Paid</span>
                <span className="text-slate-900">GHS {fine.amount.toFixed(2)}</span>
             </div>
          </div>
          
          <div className="space-y-2">
            <Button onClick={() => onComplete(reference)} className="w-full bg-slate-900 h-11 text-[10px] font-bold uppercase tracking-widest">
              Close Portal
            </Button>
            <Button variant="outline" className="w-full h-11 border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Download Receipt
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto">
      <div className="bg-blue-600 rounded-xl p-5 mb-8 text-white shadow-lg shadow-blue-600/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-[60px] -mr-16 -mt-16 rounded-full"></div>
        <div className="text-[9px] uppercase tracking-widest font-black opacity-60 mb-1">Payable Balance</div>
        <div className="flex justify-between items-end relative z-10">
          <div className="text-3xl font-black font-mono tracking-tighter">GHS {fine.amount.toFixed(2)}</div>
          <div className="text-[9px] font-bold bg-white/20 px-1.5 py-0.5 rounded backdrop-blur-sm">ID: {fine.id}</div>
        </div>
      </div>

      <div className="flex-1 space-y-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="network"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select Network</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-3 gap-2"
                      >
                        <FormItem className={`space-y-0 relative border-2 rounded-lg p-2 cursor-pointer transition-all ${field.value === 'MTN' ? 'border-yellow-400 bg-yellow-50/30 ring-2 ring-yellow-400/10' : 'border-slate-200 opacity-60 grayscale hover:opacity-100 hover:grayscale-0'}`}>
                          <FormControl><RadioGroupItem value="MTN" className="sr-only" /></FormControl>
                          <FormLabel className="flex flex-col items-center gap-2 cursor-pointer">
                             <div className="w-5 h-5 bg-yellow-400 rounded-full shadow-sm"></div>
                             <span className="text-[9px] font-black tracking-tight">MTN</span>
                          </FormLabel>
                        </FormItem>
                        
                        <FormItem className={`space-y-0 relative border-2 rounded-lg p-2 cursor-pointer transition-all ${field.value === 'Vodafone' ? 'border-red-600 bg-red-50/30 ring-2 ring-red-600/10' : 'border-slate-200 opacity-60 grayscale hover:opacity-100 hover:grayscale-0'}`}>
                          <FormControl><RadioGroupItem value="Vodafone" className="sr-only" /></FormControl>
                          <FormLabel className="flex flex-col items-center gap-2 cursor-pointer">
                             <div className="w-5 h-5 bg-red-600 rounded-full shadow-sm"></div>
                             <span className="text-[9px] font-black tracking-tight">VODA</span>
                          </FormLabel>
                        </FormItem>

                        <FormItem className={`space-y-0 relative border-2 rounded-lg p-2 cursor-pointer transition-all ${field.value === 'AirtelTigo' ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/10' : 'border-slate-200 opacity-60 grayscale hover:opacity-100 hover:grayscale-0'}`}>
                          <FormControl><RadioGroupItem value="AirtelTigo" className="sr-only" /></FormControl>
                          <FormLabel className="flex flex-col items-center gap-2 cursor-pointer">
                             <div className="w-5 h-5 bg-blue-500 rounded-full shadow-sm"></div>
                             <span className="text-[9px] font-black tracking-tight">AIRT</span>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-[9px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Wallet Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative group">
                         <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 group-focus-within:text-blue-600 transition-colors" />
                         <Input {...field} className="h-10 pl-9 text-xs font-mono font-bold tracking-widest bg-slate-50 border-slate-200 focus-visible:ring-blue-600" />
                      </div>
                    </FormControl>
                    <FormDescription className="text-[9px] leading-relaxed text-slate-400 font-medium">
                      An approval prompt will be sent to this number.
                    </FormDescription>
                    <FormMessage className="text-[9px]" />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <Button type="submit" disabled={fine.status === 'paid'} className="w-full bg-slate-900 h-12 text-xs font-black uppercase tracking-[0.15em] shadow-lg shadow-slate-900/10 hover:bg-black transition-all active:scale-[0.98]">
                 Initiate Settlement
              </Button>
              <div className="text-center">
                 <p className="text-[9px] text-slate-400 leading-normal font-medium">
                   Transactions are encrypted with AES-256 standard.<br />Merchant: <b>TP-GH-TRAFFIC-MUNI</b>
                 </p>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

