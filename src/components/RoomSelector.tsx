import React, { useState, useEffect } from 'react';
import { RoomPreset, InventoryItem } from '../types';
import { ROOM_PRESETS } from '../data/inventoryData';
import { 
  Tv, 
  BedDouble, 
  Bed, 
  Utensils, 
  WashingMachine, 
  Briefcase, 
  Car, 
  Package, 
  Plus, 
  Minus, 
  Trash2, 
  Sparkles, 
  ChevronRight, 
  MessageSquare, 
  ClipboardList, 
  X 
} from 'lucide-react';

interface RoomSelectorProps {
  items: InventoryItem[];
  onUpdateItems: (items: InventoryItem[]) => void;
  activeRoomId?: string;
  onSelectRoom?: (roomId: string) => void;
  onNext?: () => void;
  onPrev?: () => void;
  nextLabel?: string;
  prevLabel?: string;
  showAllRooms?: boolean;
}

// Map of icons for room sections and presets
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Tv: Tv,
  BedDouble: BedDouble,
  Bed: Bed,
  Utensils: Utensils,
  WashingMachine: WashingMachine,
  Briefcase: Briefcase,
  Car: Car,
  Package: Package
};

export default function RoomSelector({ 
  items, 
  onUpdateItems,
  activeRoomId: externalActiveRoomId,
  onSelectRoom,
  onNext,
  onPrev,
  nextLabel,
  prevLabel,
  showAllRooms = false
}: RoomSelectorProps) {
  // Track active room ID for navigation pill highlighting
  const [internalActiveRoomId, setInternalActiveRoomId] = useState<string>(ROOM_PRESETS[0].id);
  const activeRoomId = externalActiveRoomId || internalActiveRoomId;

  const currentRoomIndex = ROOM_PRESETS.findIndex(r => r.id === activeRoomId);
  const safeRoomIndex = currentRoomIndex >= 0 ? currentRoomIndex : 0;
  const currentRoom = ROOM_PRESETS[safeRoomIndex];
  const nextRoom = safeRoomIndex < ROOM_PRESETS.length - 1 ? ROOM_PRESETS[safeRoomIndex + 1] : null;
  const prevRoom = safeRoomIndex > 0 ? ROOM_PRESETS[safeRoomIndex - 1] : null;

  // Helper to get quantity of an item
  const getItemQty = (roomName: string, itemName: string) => {
    const found = items.find(i => i.room === roomName && i.name === itemName);
    return found ? found.quantity : 0;
  };

  // Helper to get observation of an item
  const getItemObs = (roomName: string, itemName: string) => {
    const found = items.find(i => i.room === roomName && i.name === itemName);
    return found ? found.observation || '' : '';
  };

  // Update item quantity
  const handleQuantityChange = (roomName: string, itemName: string, volume: number, change: number) => {
    const existingIndex = items.findIndex(i => i.room === roomName && i.name === itemName);
    let updated = [...items];

    if (existingIndex > -1) {
      const currentQty = updated[existingIndex].quantity;
      const newQty = currentQty + change;
      if (newQty <= 0) {
        updated.splice(existingIndex, 1);
      } else {
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty
        };
      }
    } else if (change > 0) {
      updated.push({
        id: `${roomName}-${itemName}-${Date.now()}`,
        name: itemName,
        room: roomName,
        quantity: change,
        volume: volume
      });
    }

    onUpdateItems(updated);
  };

  // Set individual item observation/note
  const handleObservationChange = (roomName: string, itemName: string, obs: string) => {
    const updated = items.map(i => {
      if (i.room === roomName && i.name === itemName) {
        return { ...i, observation: obs };
      }
      return i;
    });
    onUpdateItems(updated);
  };

  // Remove completely
  const handleRemoveItem = (id: string) => {
    onUpdateItems(items.filter(i => i.id !== id));
  };

  // Select a room
  const handleSelectRoom = (id: string) => {
    if (onSelectRoom) {
      onSelectRoom(id);
    } else {
      setInternalActiveRoomId(id);
    }
  };

  const totalVolumeAll = items.reduce((acc, curr) => acc + (curr.volume * curr.quantity), 0);
  const totalItemsAll = items.reduce((acc, curr) => acc + curr.quantity, 0);

  const roomsToRender = showAllRooms ? ROOM_PRESETS : [currentRoom].filter(Boolean);

  // Automatically scroll the active pill into view
  useEffect(() => {
    if (activeRoomId) {
      const activePill = document.getElementById(`room-pill-${activeRoomId}`);
      if (activePill) {
        activePill.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeRoomId]);

  return (
    <div className="space-y-6" id="room-selector-container">
      
      {/* Sticky Horizontal Navigation Pills */}
      <div className="sticky top-[68px] z-30 bg-slate-50/95 backdrop-blur-md py-3 border-b border-slate-200 -mx-4 px-4 scrollbar-hide">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Navegar pelos Cômodos
            </h3>
            {items.length > 0 && (
              <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-full font-mono">
                Carga: {totalItemsAll} {totalItemsAll === 1 ? 'item' : 'itens'}
              </span>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x">
            {ROOM_PRESETS.map((room) => {
              const IconComponent = ICON_MAP[room.icon] || Package;
              const roomItemsCount = items
                .filter(i => i.room === room.name)
                .reduce((acc, curr) => acc + curr.quantity, 0);
              const isSelected = activeRoomId === room.id;

              // Display clean concise labels matching the screenshot pills (Cozinha, Sala, Quarto, Outros, Área, Escritório, Área Externa, Caixas)
              const displayLabels: Record<string, string> = {
                cozinha: 'Cozinha',
                sala: 'Sala',
                quarto_principal: 'Quarto',
                quarto_secundario: 'Outros',
                servico: 'Área',
                escritorio: 'Escritório',
                externa_garagem: 'Área',
                caixas_geral: 'Caixas'
              };
              const label = displayLabels[room.id] || room.name.split(' ')[0];

              return (
                <button
                  key={room.id}
                  id={`room-pill-${room.id}`}
                  onClick={() => handleSelectRoom(room.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-black whitespace-nowrap transition-all duration-200 snap-center cursor-pointer ${
                    isSelected
                      ? 'border-red-600 bg-red-600 text-white shadow-sm shadow-red-600/15'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{label}</span>
                  {roomItemsCount > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${isSelected ? 'bg-white text-red-600' : 'bg-red-600 text-white'}`}>
                      {roomItemsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stack of environment sections */}
      <div className="space-y-8">
        {roomsToRender.map((room) => {
          const IconComponent = ICON_MAP[room.icon] || Package;
          const roomSelectedItems = items.filter(i => i.room === room.name);
          const roomVolume = roomSelectedItems.reduce((acc, curr) => acc + (curr.volume * curr.quantity), 0);
          const roomItemsCount = roomSelectedItems.reduce((acc, curr) => acc + curr.quantity, 0);

          return (
            <div 
              key={room.id} 
              id={`room-section-${room.id}`}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden scroll-mt-28 transition-all"
            >
              {/* Environment Header Banner */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-50 text-red-600 rounded-2xl shadow-xs">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-950 tracking-tight">{room.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Selecione e adicione a mobília desta área.</p>
                  </div>
                </div>

                {roomItemsCount > 0 && (
                  <div className="self-start sm:self-center px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-700 text-xs font-bold font-mono">
                    Subtotal: {roomItemsCount} {roomItemsCount === 1 ? 'item' : 'itens'}
                  </div>
                )}
              </div>

              {/* Items Grid for this environment */}
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {room.items.map((preset) => {
                    const selectedItem = items.find(i => i.room === room.name && i.name === preset.name);
                    const qty = selectedItem ? selectedItem.quantity : 0;
                    const obs = selectedItem ? selectedItem.observation || '' : '';

                    return (
                      <div 
                        key={preset.name} 
                        className={`p-3 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[140px] sm:min-h-[150px] ${
                          qty > 0 
                            ? 'border-red-200 bg-red-50/5 shadow-xs' 
                            : 'border-slate-150 bg-white hover:border-slate-300'
                        }`}
                      >
                        {/* Item Name (always on top, no truncation) */}
                        <div className="mb-2 text-center">
                          <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight break-words text-center">{preset.name}</p>
                        </div>

                        {/* Controls Container (Plus/Minus centered underneath the name) */}
                        <div className="flex flex-col items-center justify-center gap-1.5 mt-auto w-full">
                          <div className="flex items-center justify-center gap-1 sm:gap-1.5 shrink-0 w-full">
                            {/* Red Plus/Minus Controls inside clean pills */}
                            <div className="flex items-center gap-1 bg-slate-100 border border-slate-200/60 rounded-full p-0.5 shadow-xs shrink-0">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(room.name, preset.name, preset.volume, -1)}
                                className={`h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-full transition-all duration-150 bg-slate-900 hover:bg-slate-950 text-white shadow-xs shrink-0 ${qty === 0 ? 'cursor-not-allowed opacity-90' : 'hover:scale-105 active:scale-90'}`}
                                disabled={qty === 0}
                              >
                                <Minus className="h-3.5 w-3.5 stroke-[3] text-white shrink-0" />
                              </button>
                              <span className="w-4 sm:w-5 text-center text-xs sm:text-sm font-black font-mono text-slate-800 shrink-0">{qty}</span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(room.name, preset.name, preset.volume, 1)}
                                className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-150 shadow-xs hover:scale-105 active:scale-90 shrink-0"
                              >
                                <Plus className="h-3.5 w-3.5 stroke-[3] shrink-0" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Description / Observation Field */}
                        <div className="mt-2 pt-2 border-t border-dashed border-slate-200 space-y-2">
                          {qty > 0 ? (
                            <input
                              type="text"
                              placeholder="Observação (ex: Frágil)"
                              value={obs}
                              onChange={(e) => handleObservationChange(room.name, preset.name, e.target.value)}
                              className="w-full text-[10px] sm:text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-700 placeholder-slate-400 font-bold"
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(room.name, preset.name, preset.volume, 1)}
                              className="text-[11px] text-slate-400 hover:text-red-600 font-extrabold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              + Adicionar observação
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Navigation Buttons inside the room card */}
                {(onNext || onPrev || nextRoom || prevRoom) && (
                  <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                    {onPrev ? (
                      <button
                        type="button"
                        onClick={onPrev}
                        className="px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        ← {prevLabel || 'Etapa Anterior'}
                      </button>
                    ) : prevRoom ? (
                      <button
                        type="button"
                        onClick={() => handleSelectRoom(prevRoom.id)}
                        className="px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        ← {prevRoom.name}
                      </button>
                    ) : (
                      <div />
                    )}

                    {onNext ? (
                      <button
                        type="button"
                        onClick={onNext}
                        className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-md shadow-red-600/20 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {nextLabel || (nextRoom ? `Avançar para ${nextRoom.name}` : 'Avançar')} →
                      </button>
                    ) : nextRoom ? (
                      <button
                        type="button"
                        onClick={() => handleSelectRoom(nextRoom.id)}
                        className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-md shadow-red-600/20 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Avançar para {nextRoom.name} →
                      </button>
                    ) : null}
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>

      {/* Selected List Summary */}
      {items.length > 0 && (
        <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-red-500 animate-pulse" />
            <h4 className="text-sm font-black uppercase tracking-wider">
              Resumo Consolidado da sua Carga ({items.reduce((acc, curr) => acc + curr.quantity, 0)} itens)
            </h4>
          </div>
          
          <div className="divide-y divide-slate-800 max-h-[350px] overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-slate-100 truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    <span className="text-red-400 font-bold">{item.room}</span>
                    {item.observation && <span className="italic ml-2 text-amber-400">({item.observation})</span>}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right font-mono">
                    <p className="font-black text-slate-100 font-mono">Qtd: {item.quantity}</p>
                  </div>
                  <button
                    type="button"
                    id={`delete-btn-${item.id}`}
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
                    title="Remover item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
