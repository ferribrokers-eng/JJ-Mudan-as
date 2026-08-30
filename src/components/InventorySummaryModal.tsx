import React from 'react';
import { InventoryItem } from '../types';
import { X, Trash2, ClipboardList, Package } from 'lucide-react';

interface InventorySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onUpdateItems: (items: InventoryItem[]) => void;
}

export default function InventorySummaryModal({
  isOpen,
  onClose,
  items,
  onUpdateItems
}: InventorySummaryModalProps) {
  if (!isOpen) return null;

  const totalVolume = items.reduce((acc, curr) => acc + (curr.volume * curr.quantity), 0);
  const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleRemove = (id: string) => {
    onUpdateItems(items.filter(i => i.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm("Deseja realmente zerar todos os itens selecionados no inventário?")) {
      onUpdateItems([]);
      onClose();
    }
  };

  // Group items by room
  const groupedByRoom: Record<string, InventoryItem[]> = {};
  items.forEach(item => {
    if (!groupedByRoom[item.room]) {
      groupedByRoom[item.room] = [];
    }
    groupedByRoom[item.room].push(item);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-150 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                Resumo da Sua Carga
              </h3>
              <p className="text-xs text-slate-500">
                {totalItems} {totalItems === 1 ? 'item' : 'itens'} selecionados • ~{totalVolume.toFixed(2)} m³
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content / List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {items.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Package className="h-10 w-10 mx-auto text-slate-300 stroke-1" />
              <p className="text-sm font-bold">Nenhum móvel ou item selecionado ainda.</p>
              <p className="text-xs">Navegue pelas etapas e adicione seus pertences com os botões +.</p>
            </div>
          ) : (
            Object.entries(groupedByRoom).map(([roomName, roomItems]) => (
              <div key={roomName} className="space-y-2">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">
                  {roomName}
                </h4>
                <div className="bg-slate-50 rounded-2xl border border-slate-200/80 divide-y divide-slate-200/60 overflow-hidden">
                  {roomItems.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-slate-900 truncate">{item.name}</p>
                        {item.observation && (
                          <p className="text-[10px] text-amber-600 italic mt-0.5">
                            Obs: {item.observation}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono font-black text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                          Qtd: {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Remover este item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-150 bg-slate-50/70 flex items-center justify-between gap-3">
          {items.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
            >
              Limpar Todos os Itens
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
          >
            Fechar e Continuar
          </button>
        </div>

      </div>
    </div>
  );
}
