import React from 'react';
import { AddressInfo } from '../types';
import { MapPin, Info, ArrowRight } from 'lucide-react';

interface LocationDetailsProps {
  origin: AddressInfo;
  destination: AddressInfo;
  onChangeOrigin: (origin: AddressInfo) => void;
  onChangeDestination: (destination: AddressInfo) => void;
}

export default function LocationDetails({
  origin,
  destination,
  onChangeOrigin,
  onChangeDestination
}: LocationDetailsProps) {

  // Update specific field in AddressInfo
  const handleUpdate = (type: 'origin' | 'destination', field: keyof AddressInfo, value: any) => {
    if (type === 'origin') {
      onChangeOrigin({ ...origin, [field]: value });
    } else {
      onChangeDestination({ ...destination, [field]: value });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="location-details-container">
      
      {/* Origin Column */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Endereço de Origem (Retirada)</h3>
            <p className="text-xs text-slate-500">De onde estamos retirando a mudança?</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="origin-address">Rua, Número e Bairro *</label>
            <input
              type="text"
              id="origin-address"
              placeholder="Ex: Av. Paulista, 1000 - Bela Vista"
              required
              value={origin.address}
              onChange={(e) => handleUpdate('origin', 'address', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-slate-50/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="origin-city">Cidade *</label>
              <input
                type="text"
                id="origin-city"
                placeholder="Ex: São Paulo"
                required
                value={origin.city}
                onChange={(e) => handleUpdate('origin', 'city', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-slate-50/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="origin-state">Estado *</label>
              <input
                type="text"
                id="origin-state"
                placeholder="Ex: SP"
                required
                maxLength={2}
                value={origin.state}
                onChange={(e) => handleUpdate('origin', 'state', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-slate-50/30 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="origin-floor">Andar / Pavimento</label>
              <input
                type="text"
                id="origin-floor"
                placeholder="Ex: Térreo, 4° andar, Sobrado"
                value={origin.floor}
                onChange={(e) => handleUpdate('origin', 'floor', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-slate-50/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="origin-parking">Acesso do Caminhão</label>
              <select
                id="origin-parking"
                value={origin.parkingDistance}
                onChange={(e) => handleUpdate('origin', 'parkingDistance', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
              >
                <option value="near">Perto (Menos de 15 metros)</option>
                <option value="medium">Médio (15 a 30 metros)</option>
                <option value="far">Longo (Mais de 30 metros)</option>
              </select>
            </div>
          </div>

          {/* Checklist options */}
          <div className="pt-2 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-100 hover:bg-slate-50 select-none">
              <input
                type="checkbox"
                id="origin-elevator"
                checked={origin.hasElevator}
                onChange={(e) => handleUpdate('origin', 'hasElevator', e.target.checked)}
                className="h-4.5 w-4.5 text-blue-900 rounded border-slate-300 focus:ring-blue-900"
              />
              <div>
                <p className="text-xs font-semibold text-slate-800">Possui elevador funcional?</p>
                <p className="text-[10px] text-slate-500">Se marcado como falso, indica transporte por escadas.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-100 hover:bg-slate-50 select-none">
              <input
                type="checkbox"
                id="origin-packing"
                checked={origin.needsPacking}
                onChange={(e) => handleUpdate('origin', 'needsPacking', e.target.checked)}
                className="h-4.5 w-4.5 text-blue-900 rounded border-slate-300 focus:ring-blue-900"
              />
              <div>
                <p className="text-xs font-semibold text-slate-800">Necessita embalar eletrodomésticos e eletrônicos?</p>
                <p className="text-[10px] text-slate-500">Mantas de proteção especiais serão aplicadas no local.</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Destination Column */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Endereço de Destino (Entrega)</h3>
            <p className="text-xs text-slate-500">Para onde levaremos a mudança?</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="dest-address">Rua, Número e Bairro *</label>
            <input
              type="text"
              id="dest-address"
              placeholder="Ex: Al. Lorena, 500 - Jardins"
              required
              value={destination.address}
              onChange={(e) => handleUpdate('destination', 'address', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-slate-50/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="dest-city">Cidade *</label>
              <input
                type="text"
                id="dest-city"
                placeholder="Ex: São Paulo"
                required
                value={destination.city}
                onChange={(e) => handleUpdate('destination', 'city', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-slate-50/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="dest-state">Estado *</label>
              <input
                type="text"
                id="dest-state"
                placeholder="Ex: SP"
                required
                maxLength={2}
                value={destination.state}
                onChange={(e) => handleUpdate('destination', 'state', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-slate-50/30 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="dest-floor">Andar / Pavimento</label>
              <input
                type="text"
                id="dest-floor"
                placeholder="Ex: 8° andar (Ap 82), Térreo"
                value={destination.floor}
                onChange={(e) => handleUpdate('destination', 'floor', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-slate-50/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="dest-parking">Acesso do Caminhão</label>
              <select
                id="dest-parking"
                value={destination.parkingDistance}
                onChange={(e) => handleUpdate('destination', 'parkingDistance', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
              >
                <option value="near">Perto (Menos de 15 metros)</option>
                <option value="medium">Médio (15 a 30 metros)</option>
                <option value="far">Longo (Mais de 30 metros)</option>
              </select>
            </div>
          </div>

          {/* Checklist options */}
          <div className="pt-2 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-100 hover:bg-slate-50 select-none">
              <input
                type="checkbox"
                id="dest-elevator"
                checked={destination.hasElevator}
                onChange={(e) => handleUpdate('destination', 'hasElevator', e.target.checked)}
                className="h-4.5 w-4.5 text-blue-900 rounded border-slate-300 focus:ring-blue-900"
              />
              <div>
                <p className="text-xs font-semibold text-slate-800">Possui elevador funcional?</p>
                <p className="text-[10px] text-slate-500">Se marcado como falso, indica transporte por escadas.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-100 hover:bg-slate-50 select-none">
              <input
                type="checkbox"
                id="dest-packing"
                checked={destination.needsPacking}
                onChange={(e) => handleUpdate('destination', 'needsPacking', e.target.checked)}
                className="h-4.5 w-4.5 text-blue-900 rounded border-slate-300 focus:ring-blue-900"
              />
              <div>
                <p className="text-xs font-semibold text-slate-800">Desembalagem no destino requerida?</p>
                <p className="text-[10px] text-slate-500">Nossa equipe removerá plásticos e mantas dos móveis grandes.</p>
              </div>
            </label>
          </div>
        </div>
      </div>

    </div>
  );
}
