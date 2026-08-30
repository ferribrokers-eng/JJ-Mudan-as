import React from 'react';
import { MoveProposal } from '../types';
import { 
  Truck, 
  Sparkles, 
  ArrowRight, 
  Compass, 
  MapPin, 
  Hammer, 
  PackageCheck,
  CalendarDays,
  ShieldCheck,
  Info
} from 'lucide-react';

interface InventorySummaryProps {
  proposal: MoveProposal;
}

export default function InventorySummary({ proposal }: InventorySummaryProps) {
  const totalVolume = proposal.items.reduce((acc, curr) => acc + (curr.volume * curr.quantity), 0);
  const totalItems = proposal.items.reduce((acc, curr) => acc + curr.quantity, 0);
  const materialsCount = proposal.materials.reduce((acc, curr) => acc + curr.quantity, 0);
  const selectedServices = proposal.services.filter(s => s.selected);

  // Recommended Truck calculation
  let truckType = 'Fiorino ou Van de Carga';
  let truckDescription = 'Excelente para mudanças compactas, caixas, malas e poucos móveis pequenos.';
  let truckImageColor = 'bg-teal-500';

  if (totalVolume > 35) {
    truckType = 'Caminhão Baú Truck / Carreta';
    truckDescription = 'Necessário para mudanças completas de grandes residências (4+ quartos) com alto volume de mobília.';
    truckImageColor = 'bg-red-600';
  } else if (totalVolume > 18) {
    truckType = 'Caminhão Baú Toco (Grande)';
    truckDescription = 'Recomendado para casas de 3 quartos ou apartamentos grandes com muitos eletrodomésticos e móveis.';
    truckImageColor = 'bg-amber-500';
  } else if (totalVolume > 8) {
    truckType = 'Caminhão Baú 3/4 (Médio)';
    truckDescription = 'Perfeito para apartamentos de 1 a 2 dormitórios com mobília padrão de sala, quarto e cozinha.';
    truckImageColor = 'bg-[#0a192f]';
  } else if (totalVolume > 3) {
    truckType = 'HR / Iveco Daily (Compacto)';
    truckDescription = 'Ideal para kitnets, apartamentos pequenos sem muitos móveis pesados ou mudanças de estúdio.';
    truckImageColor = 'bg-slate-800';
  }

  const resMap: Record<string, string> = {
    casa: 'Casa Térrea',
    apartamento: 'Apartamento',
    sobrado: 'Sobrado',
    comercial: 'Comercial/Escritório',
    loja: 'Loja / Ponto'
  };

  return (
    <div className="space-y-6" id="inventory-summary-container">
      
      {/* Metrics Row (Bento Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute right-2 top-2 h-16 w-16 bg-[#0a192f]/50 rounded-full blur-xl" />
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Volume Total</p>
          <p className="text-3xl font-extrabold font-mono text-slate-100 mt-2">
            {totalVolume.toFixed(2)} <span className="text-sm font-normal text-slate-300">m³</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Cálculo de cubagem padrão</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total de Itens</p>
          <p className="text-3xl font-extrabold font-mono text-slate-800 mt-2">
            {totalItems} <span className="text-sm font-normal text-slate-500">unid.</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Móveis e caixas adicionados</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Insumos/Materiais</p>
          <p className="text-3xl font-extrabold font-mono text-slate-800 mt-2">
            {materialsCount} <span className="text-sm font-normal text-slate-500">itens</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Caixas e fita para embalar</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Serviços Extras</p>
          <p className="text-3xl font-extrabold font-mono text-slate-800 mt-2">
            {selectedServices.length} <span className="text-sm font-normal text-slate-500">contr.</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Adicionais selecionados</p>
        </div>
      </div>

      {/* Truck Suggestion Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-xl text-white ${truckImageColor} shadow-md flex-shrink-0 animate-pulse`}>
            <Truck className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#0a192f]/10 text-slate-950 font-mono">Recomendação de Frota</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">Mudança Fácil</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 mt-1.5">{truckType}</h4>
            <p className="text-xs text-slate-600 mt-1 leading-normal max-w-xl">{truckDescription}</p>
          </div>
        </div>
      </div>

      {/* Detailed summary tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Addresses & Client Checklist */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Localização & Agendamento</h4>
          
          <div className="space-y-3.5 text-sm">
            {/* Move Date */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CalendarDays className="h-5 w-5 text-slate-900" />
              <div>
                <p className="text-xs font-semibold text-slate-800">Data da Mudança</p>
                <p className="text-sm font-bold text-slate-950 font-mono">
                  {proposal.client.moveDate ? new Date(proposal.client.moveDate).toLocaleDateString('pt-BR') : 'Não agendado'}
                </p>
              </div>
            </div>

            {/* Route Timeline style */}
            <div className="relative pl-6 space-y-5 border-l-2 border-dashed border-slate-200 ml-3">
              {/* Origin dot */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-emerald-500 ring-4 ring-emerald-50 border-2 border-white" />
                <p className="text-xs font-bold text-slate-800">Origem: {resMap[proposal.client.residenceType] || 'Residencial'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{proposal.origin.address || 'Não preenchido'}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Andar: {proposal.origin.floor || 'Térreo'} • Elevador: {proposal.origin.hasElevator ? 'Sim' : 'Não'}
                </p>
              </div>

              {/* Destination dot */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-orange-500 ring-4 ring-orange-50 border-2 border-white" />
                <p className="text-xs font-bold text-slate-800">Destino</p>
                <p className="text-xs text-slate-500 mt-0.5">{proposal.destination.address || 'Não preenchido'}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Andar: {proposal.destination.floor || 'Térreo'} • Elevador: {proposal.destination.hasElevator ? 'Sim' : 'Não'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Services & Materials List */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Insumos e Serviços</h4>

          <div className="space-y-3">
            {/* Services List summary */}
            {selectedServices.length > 0 ? (
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Serviços Contratados</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedServices.map(s => (
                    <span key={s.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0a192f]/10 text-slate-950 text-xs font-semibold">
                      <Hammer className="h-3 w-3" />
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Nenhum serviço adicional selecionado.</p>
            )}

            {/* Materials summary */}
            {materialsCount > 0 ? (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Materiais Requisitados</p>
                <div className="grid grid-cols-2 gap-2 max-h-[110px] overflow-y-auto pr-1">
                  {proposal.materials.filter(m => m.quantity > 0).map(m => (
                    <div key={m.id} className="flex justify-between items-center text-xs p-1.5 bg-slate-50 rounded-lg">
                      <span className="text-slate-600 truncate mr-2">{m.name}</span>
                      <span className="font-mono font-bold text-slate-800 shrink-0">{m.quantity} {m.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic pt-2 border-t border-slate-100">Nenhum material de embalagem requisitado.</p>
            )}
          </div>
        </div>

      </div>

      {/* Safety info note */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 flex items-start gap-2.5">
        <Info className="h-4.5 w-4.5 text-[#0a192f] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Nossa cubagem estimada é calculada utilizando coeficientes volumétricos de mudança residencial padrão. No dia da mudança, as peças de mobília serão envoltas em mantas térmicas acolchoadas de alta densidade no interior do caminhão, otimizando o preenchimento seguro do baú.
        </p>
      </div>

    </div>
  );
}
