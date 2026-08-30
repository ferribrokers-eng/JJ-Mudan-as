import React from 'react';
import { MaterialItem, ServiceItem } from '../types';
import { 
  Package, 
  Minus, 
  Plus, 
  Check, 
  Truck, 
  ShieldAlert, 
  UserPlus, 
  Hammer, 
  Wrench, 
  Layers 
} from 'lucide-react';

interface ServiceSelectorProps {
  materials: MaterialItem[];
  services: ServiceItem[];
  onUpdateMaterials: (materials: MaterialItem[]) => void;
  onUpdateServices: (services: ServiceItem[]) => void;
}

const SERVICE_ICONS: Record<string, React.ComponentType<any>> = {
  desmontagem: Hammer,
  montagem: Wrench,
  embalamento_profissional: Layers,
  icamento: Truck,
  seguro_mudanca: ShieldAlert,
  ajudantes_extras: UserPlus
};

export default function ServiceSelector({
  materials,
  services,
  onUpdateMaterials,
  onUpdateServices
}: ServiceSelectorProps) {

  // Update material quantity
  const handleMaterialChange = (id: string, change: number) => {
    const updated = materials.map(m => {
      if (m.id === id) {
        const nextQty = Math.max(0, m.quantity + change);
        return { ...m, quantity: nextQty };
      }
      return m;
    });
    onUpdateMaterials(updated);
  };

  // Toggle service
  const handleServiceToggle = (id: string) => {
    const updated = services.map(s => {
      if (s.id === id) {
        return { ...s, selected: !s.selected };
      }
      return s;
    });
    onUpdateServices(updated);
  };

  return (
    <div className="space-y-10" id="services-selector-container">
      
      {/* Materials Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Materiais de Embalagem (Opcional)</h3>
          <p className="text-xs text-slate-500">
            Deseja que nossa equipe forneça materiais profissionais para embalar sua mudança? Adicione as quantidades.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map((m) => (
            <div 
              key={m.id} 
              className={`p-4 rounded-xl border transition-all duration-200 flex items-start justify-between gap-4 ${
                m.quantity > 0 
                  ? 'border-slate-900/20 bg-[#0a192f]/5 shadow-xs' 
                  : 'border-slate-150 bg-white hover:border-slate-300'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                    <Package className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-semibold text-slate-800">{m.name}</p>
                </div>
                <p className="text-xs text-slate-500 leading-normal">{m.description}</p>
              </div>

              {/* Quantity Changer */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs self-center">
                <button
                  type="button"
                  id={`material-minus-${m.id}`}
                  onClick={() => handleMaterialChange(m.id, -1)}
                  className={`p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors ${
                    m.quantity === 0 ? 'opacity-35 cursor-not-allowed' : ''
                  }`}
                  disabled={m.quantity === 0}
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center text-xs font-bold font-mono text-slate-800">
                  {m.quantity}
                </span>
                <button
                  type="button"
                  id={`material-plus-${m.id}`}
                  onClick={() => handleMaterialChange(m.id, 1)}
                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Serviços Adicionais Especializados</h3>
          <p className="text-xs text-slate-500">
            Selecione serviços adicionais para garantir uma mudança tranquila e sem esforço para você e sua família.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((s) => {
            const IconComponent = SERVICE_ICONS[s.id] || Truck;
            return (
              <button
                type="button"
                key={s.id}
                id={`service-toggle-${s.id}`}
                onClick={() => handleServiceToggle(s.id)}
                className={`p-4 rounded-xl border text-left transition-all duration-200 flex items-start gap-4 w-full cursor-pointer ${
                  s.selected 
                    ? 'border-[#0a192f] bg-[#0a192f]/5 text-slate-900 shadow-sm ring-1 ring-[#0a192f]/20' 
                    : 'border-slate-150 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${s.selected ? 'bg-[#0a192f] text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    {s.name}
                    {s.selected && (
                      <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-[#0a192f] text-white p-0.5">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 leading-normal mt-1">{s.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
