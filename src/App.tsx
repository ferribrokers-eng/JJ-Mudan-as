import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, 
  MapPin, 
  CheckCircle, 
  ArrowRight, 
  Phone, 
  Mail, 
  Calendar, 
  Sparkles,
  Send,
  Package,
  Undo,
  X,
  Home,
  Briefcase,
  Store,
  Info,
  Building2,
  ShieldCheck,
  User,
  ClipboardList
} from 'lucide-react';

import { MoveProposal, InventoryItem, MaterialItem, ServiceItem, AddressInfo, ClientInfo } from './types';
import { ROOM_PRESETS, INITIAL_MATERIALS, INITIAL_SERVICES } from './data/inventoryData';
import RoomSelector from './components/RoomSelector';
import ServiceSelector from './components/ServiceSelector';
import InventorySummaryModal from './components/InventorySummaryModal';
import OSMMap from './components/OSMMap';
import { CompanyProvider, useCompany } from './context/CompanyContext';
import ClientAuthModal from './components/ClientAuthModal';
import AdminPanel from './components/AdminPanel';
import JJLogo from './components/JJLogo';

const RESIDENCE_TYPES = [
  { id: 'casa', label: 'Casa / Sobrado', icon: Sparkles, desc: 'Casa térrea ou sobrado' },
  { id: 'apartamento', label: 'Apartamento', icon: Home, desc: 'Apartamento residencial' },
  { id: 'comercial', label: 'Escritório', icon: Briefcase, desc: 'Empresa ou escritório' },
  { id: 'loja', label: 'Loja / Ponto', icon: Store, desc: 'Comércio ou depósito' }
];

export default function App() {
  return (
    <CompanyProvider>
      <MoveSimulator />
      <ClientAuthModal />
      <AdminPanel />
    </CompanyProvider>
  );
}

const geocodeAddress = async (address: AddressInfo) => {
  const streetAndNum = address.number ? `${address.address}, ${address.number}` : address.address;
  const query = `${streetAndNum}, ${address.neighborhood || ''}, ${address.city} - ${address.state}, Brasil`;
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'MudancaFacilEstimator/1.0 (ferribrokers@gmail.com)'
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data[0]) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
    }
  } catch (err) {
    console.error("Nominatim geocoding error:", err);
  }

  const query2 = `${address.address}, ${address.city} - ${address.state}, Brasil`;
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query2)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'MudancaFacilEstimator/1.0 (ferribrokers@gmail.com)'
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data[0]) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
    }
  } catch (err) {
    console.error("Nominatim fallback 1 geocoding error:", err);
  }

  if (address.cep) {
    try {
      const fallbackQuery = `${address.cep}, ${address.city}, Brasil`;
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fallbackQuery)}&format=json&limit=1`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'MudancaFacilEstimator/1.0 (ferribrokers@gmail.com)'
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data[0]) {
          return {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon)
          };
        }
      }
    } catch (err) {
      console.error("Nominatim CEP geocoding fallback error:", err);
    }
  }
  return null;
};

function MoveSimulator() {
  const { activeCompany, openAuthModal, openAdminModal, loggedCompany } = useCompany();

  const [proposalId] = useState<string>(`edm-${Math.random().toString(36).substr(2, 9)}`);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);
  
  // App States
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>(INITIAL_MATERIALS);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  
  const [origin, setOrigin] = useState<AddressInfo>({
    address: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    cep: '',
    floor: '',
    hasElevator: false,
    needsPacking: false,
    parkingDistance: 'near',
    hasStairs: false,
    stairsFlights: 0
  });

  const [destination, setDestination] = useState<AddressInfo>({
    address: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    cep: '',
    floor: '',
    hasElevator: false,
    needsPacking: false,
    parkingDistance: 'near',
    hasStairs: false,
    stairsFlights: 0
  });

  const [client, setClient] = useState<ClientInfo>({
    name: '',
    email: '',
    whatsapp: '',
    moveDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days from now
    residenceType: 'casa',
    observations: ''
  });

  // Step state: 0 to 7 = Rooms (0: Cozinha, 1: Sala, etc.), 8 = Materiais, 9 = Endereços, 10 = Contato/Envio
  const [activeStep, setActiveStep] = useState<number>(0);

  const [isSending, setIsSending] = useState<boolean>(false);
  const [lastSavedProposal, setLastSavedProposal] = useState<MoveProposal | null>(null);

  // Route & Distance Calculation States
  const [distanceKm, setDistanceKm] = useState<string>('');
  const [durationMin, setDurationMin] = useState<number | null>(null);
  const [routeError, setRouteError] = useState<string>('');
  const [isCalculatingRoute, setIsCalculatingRoute] = useState<boolean>(false);

  // OpenStreetMap Coordinates and Route states
  const [originCoords, setOriginCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<any | null>(null);

  const calculateDistance = async () => {
    setIsCalculatingRoute(true);
    setRouteError('');

    try {
      let origCo = originCoords;
      if (!origCo) {
        const result = await geocodeAddress(origin);
        if (result) {
          origCo = { lat: result.lat, lon: result.lon };
          setOriginCoords(origCo);
        } else {
          throw new Error("Não foi possível geocodificar o endereço de origem.");
        }
      }

      let destCo = destinationCoords;
      if (!destCo) {
        const result = await geocodeAddress(destination);
        if (result) {
          destCo = { lat: result.lat, lon: result.lon };
          setDestinationCoords(destCo);
        } else {
          throw new Error("Não foi possível geocodificar o endereço de destino.");
        }
      }

      if (origCo && destCo) {
        const url = `https://router.project-osrm.org/route/v1/driving/${origCo.lon},${origCo.lat};${destCo.lon},${destCo.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.code === 'Ok' && data.routes && data.routes[0]) {
            const route = data.routes[0];
            const distanceVal = (route.distance / 1000).toFixed(1);
            const durationVal = Math.round(route.duration / 60);

            setDistanceKm(distanceVal);
            setDurationMin(durationVal);
            setRouteGeometry(route.geometry);
            setRouteError('');
          } else {
            throw new Error("Nenhuma rota viável por carro encontrada entre os endereços.");
          }
        } else {
          throw new Error("Serviço de cálculo de rota temporariamente indisponível.");
        }
      }
    } catch (err: any) {
      console.error("Erro ao calcular rota:", err);
      setRouteError(err.message || 'Erro de geocodificação ou cálculo de rota.');
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // CEP Search and Autocomplete handler
  const handleCepSearch = async (cepValue: string, isOrigin: boolean) => {
    let formatted = cepValue.replace(/\D/g, '');
    if (formatted.length > 8) {
      formatted = formatted.slice(0, 8);
    }
    if (formatted.length > 5) {
      formatted = `${formatted.slice(0, 5)}-${formatted.slice(5)}`;
    }

    const setAddress = isOrigin ? setOrigin : setDestination;
    setAddress(prev => ({ ...prev, cep: formatted }));

    const cleanCep = formatted.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        if (response.ok) {
          const data = await response.json();
          if (!data.erro) {
            setAddress(prev => ({
              ...prev,
              address: data.logradouro || prev.address,
              neighborhood: data.bairro || prev.neighborhood,
              city: data.localidade || prev.city,
              state: data.uf || prev.state
            }));
          }
        }
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
      }
    }
  };

  // Clear cached coords when address changes
  useEffect(() => {
    setOriginCoords(null);
    setRouteGeometry(null);
  }, [origin.address, origin.number, origin.city, origin.state]);

  useEffect(() => {
    setDestinationCoords(null);
    setRouteGeometry(null);
  }, [destination.address, destination.number, destination.city, destination.state]);

  // Debounced Effect for automatic route calculation when addresses are filled
  useEffect(() => {
    const originComplete = origin.address.trim().length > 5 && origin.number?.trim().length > 0 && origin.city.trim().length > 1 && origin.state.trim().length === 2;
    const destinationComplete = destination.address.trim().length > 5 && destination.number?.trim().length > 0 && destination.city.trim().length > 1 && destination.state.trim().length === 2;

    if (!originComplete || !destinationComplete) {
      return;
    }

    const timer = setTimeout(() => {
      calculateDistance();
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    origin.address,
    origin.number,
    origin.city,
    origin.state,
    destination.address,
    destination.number,
    destination.city,
    destination.state
  ]);

  // Load from localStorage if present on start
  useEffect(() => {
    const saved = localStorage.getItem('mudancafacil_last_proposal');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as MoveProposal;
        setLastSavedProposal(parsed);
      } catch (e) {
        console.error("Erro ao carregar proposta do cache local", e);
      }
    }
  }, []);

  const totalVolume = selectedItems.reduce((acc, curr) => acc + (curr.volume * curr.quantity), 0);
  const totalItems = selectedItems.reduce((acc, curr) => acc + curr.quantity, 0);

  const currentProposal: MoveProposal = {
    id: proposalId,
    client,
    origin,
    destination,
    items: selectedItems,
    materials,
    services,
    createdAt: new Date().toISOString(),
    distanceKm: distanceKm || undefined,
    durationMin: durationMin || undefined
  };

  // Final Action: Send directly to WhatsApp
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Quick validation
    if (!client.name.trim()) {
      alert("Por favor, preencha o seu Nome Completo.");
      return;
    }
    if (!client.whatsapp.trim() || client.whatsapp.length < 10) {
      alert("Por favor, preencha um número de WhatsApp válido (com DDD).");
      return;
    }
    if (!origin.address.trim() || !origin.number?.trim() || !destination.address.trim() || !destination.number?.trim()) {
      alert("Por favor, preencha a rua e o número nos endereços de origem e destino.");
      return;
    }

    setIsSending(true);

    try {
      // 1. Save proposal to localStorage
      localStorage.setItem('mudancafacil_last_proposal', JSON.stringify(currentProposal));
      setLastSavedProposal(currentProposal);

      // 2. Formulate WhatsApp Message
      const getItemEmoji = (name: string): string => {
        const lower = name.toLowerCase();
        if (lower.includes('sofá') || lower.includes('poltrona') || lower.includes('puff')) return '🛋️';
        if (lower.includes('geladeira') || lower.includes('refrigerador') || lower.includes('freezer')) return '❄️';
        if (lower.includes('fogão') || lower.includes('microondas') || lower.includes('forno') || lower.includes('coifa')) return '🍳';
        if (lower.includes('máquina') || lower.includes('tanquinho') || lower.includes('secadora') || lower.includes('lava')) return '🧺';
        if (lower.includes('mesa') || lower.includes('escrivaninha') || lower.includes('aparador')) return '🍽️';
        if (lower.includes('cadeira') || lower.includes('banqueta') || lower.includes('poltrona')) return '🪑';
        if (lower.includes('cama') || lower.includes('colchão') || lower.includes('beliche') || lower.includes('box')) return '🛏️';
        if (lower.includes('guarda-roupa') || lower.includes('roupeiro') || lower.includes('armário')) return '👗';
        if (lower.includes('cômoda') || lower.includes('criado') || lower.includes('balcão') || lower.includes('estante') || lower.includes('rack') || lower.includes('painel') || lower.includes('aparador') || lower.includes('buffet')) return '🗄️';
        if (lower.includes('tv') || lower.includes('televisão') || lower.includes('monitor') || lower.includes('computador') || lower.includes('notebook')) return '📺';
        if (lower.includes('caixa') || lower.includes('embalagem') || lower.includes('sacola') || lower.includes('organizador') || lower.includes('pacote') || lower.includes('envelopado')) return '📦';
        if (lower.includes('mala') || lower.includes('bolsa')) return '💼';
        if (lower.includes('espelho') || lower.includes('quadro') || lower.includes('tela')) return '🖼️';
        if (lower.includes('planta') || lower.includes('vaso')) return '🪴';
        if (lower.includes('bicicleta') || lower.includes('bike') || lower.includes('patinete')) return '🚲';
        if (lower.includes('ventilador') || lower.includes('aquecedor') || lower.includes('ar condicionado')) return '🌀';
        if (lower.includes('tapete')) return '🧶';
        if (lower.includes('livro')) return '📚';
        if (lower.includes('brinquedo')) return '🧸';
        if (lower.includes('utensílio') || lower.includes('louça') || lower.includes('panela') || lower.includes('micro-ondas')) return '🍽️';
        return '📦';
      };

      const formatAddressMessage = (addr: AddressInfo) => {
        let parts = [];
        if (addr.address) {
          const streetAndNum = addr.number ? `${addr.address}, ${addr.number}` : addr.address;
          parts.push(`• *Endereço:* ${streetAndNum}`);
        }
        if (addr.neighborhood) parts.push(`• *Bairro:* ${addr.neighborhood}`);
        if (addr.city) parts.push(`• *Cidade/UF:* ${addr.city} - ${addr.state}`);
        if (addr.cep) parts.push(`• *CEP:* ${addr.cep}`);
        if (addr.floor) {
          const isNum = !isNaN(Number(addr.floor));
          parts.push(`• *Andar:* ${addr.floor}${isNum ? 'º andar' : ''}`);
        }
        parts.push(`• *Elevador:* ${addr.hasElevator ? 'Sim ✅' : 'Não ❌'}`);
        parts.push(`• *Escada:* ${addr.hasStairs ? `Sim ✅ (${addr.stairsFlights} lances)` : 'Não ❌'}`);
        return parts.join('\n');
      };

      const itemsString = selectedItems
        .map(item => {
          const emoji = getItemEmoji(item.name);
          const obs = item.observation ? ` _(${item.observation})_` : '';
          return `${emoji} *${item.name}*: ${item.quantity}${obs}`;
        })
        .join('\n');

      const materialsString = materials
        .filter(m => m.quantity > 0)
        .map(m => `📦 *${m.name}*: ${m.quantity}`)
        .join('\n');

      const servicesString = services
        .filter(s => s.selected)
        .map(s => `🛠️ *${s.name}*`)
        .join('\n');

      const moveDateStr = new Date(client.moveDate).toLocaleDateString('pt-BR');

      const residenceTypeLabels: Record<string, string> = {
        casa: 'Casa / Sobrado',
        apartamento: 'Apartamento',
        comercial: 'Escritório',
        loja: 'Loja / Ponto'
      };
      const residenceTypeLabel = residenceTypeLabels[client.residenceType] || 'Não informado';

      const companyNameHeader = activeCompany.companyName || 'JJ Mudanças';

      const whatsappText = `🚚 *${companyNameHeader} - Solicitação de Orçamento* 🚚\n\n` +
        `Olá! Gostaria de solicitar um orçamento para minha mudança com base nos itens selecionados abaixo:\n\n` +
        `👤 *DADOS DO CLIENTE*\n` +
        `• *Nome:* ${client.name}\n` +
        `• *WhatsApp:* ${client.whatsapp}\n` +
        (client.email ? `• *E-mail:* ${client.email}\n` : '') +
        `• *Data Pretendida:* ${moveDateStr}\n\n` +
        `🏠 *TIPO DE IMÓVEL:*\n` +
        `${residenceTypeLabel}\n\n` +
        `📍 *ENDEREÇO DE RETIRADA (ORIGEM)*\n` +
        `${formatAddressMessage(origin)}\n\n` +
        `🏁 *ENDEREÇO DE ENTREGA (DESTINO)*\n` +
        `${formatAddressMessage(destination)}\n\n` +
        (distanceKm ? `🛣️ *ROTA E DISTÂNCIA ESTIMADA*\n• *Distância:* ${distanceKm} km\n` + (durationMin ? `• *Tempo Estimado de Viagem:* ~${durationMin} minutos\n` : '') + `\n` : '') +
        `📊 *RESUMO DA CARGA*\n` +
        `• *Total de Móveis/Caixas:* ${totalItems} itens\n` +
        `• *Volume Estimado:* ${totalVolume.toFixed(2)} m³\n` +
        `• *Valor do Serviço:* A combinar / Sob Consulta\n\n` +
        `📋 *INVENTÁRIO DETALHADO DE ITENS:*\n` +
        `${itemsString}\n\n` +
        (materialsString ? `📦 *MATERIAIS DE EMBALAGEM:*\n${materialsString}\n\n` : '') +
        (servicesString ? `🛠️ *SERVIÇOS ADICIONAIS:*\n${servicesString}\n\n` : '') +
        (client.observations ? `💬 *OBSERVAÇÕES:* ${client.observations}\n\n` : '') +
        `Aguardo retorno com o valor da mudança! 😊`;

      // Redirect user to WhatsApp API
      const targetPhone = activeCompany.whatsapp ? activeCompany.whatsapp.replace(/\D/g, '') : '11959803341';
      const cleanPhone = targetPhone.startsWith('55') ? targetPhone : `55${targetPhone}`;
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(whatsappText)}`;

      // Open WhatsApp
      setTimeout(() => {
        try {
          window.open(whatsappUrl, '_blank');
        } catch (e) {
          console.warn("Bloqueador de popups impediu abertura automática do WhatsApp.");
        }
      }, 200);

    } catch (err) {
      console.error("Erro ao redirecionar para WhatsApp", err);
      alert("Desculpe, ocorreu um erro. Por favor, tente novamente.");
    } finally {
      setIsSending(false);
    }
  };

  const handleResetProposal = () => {
    if (confirm("Deseja realmente iniciar um novo inventário? Isso limpará os itens atuais.")) {
      setSelectedItems([]);
      setMaterials(INITIAL_MATERIALS);
      setServices(INITIAL_SERVICES);
    }
  };

  const scrollToSection = (id: string) => {
    if (id === 'address-section') {
      setActiveStep(9);
    } else if (id === 'contact-section') {
      setActiveStep(10);
    }
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-32" id="app-root-container">
      {/* Professional White-Label Header */}
      <header 
        className="border-b border-slate-900 text-white sticky top-0 z-50 shadow-md transition-colors bg-[#0a192f]"
        style={{ backgroundColor: activeCompany.primaryColor || '#0a192f' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            {activeCompany.logoUrl ? (
              <div className="h-10 px-2.5 py-1 bg-white rounded-xl flex items-center justify-center shadow-md overflow-hidden shrink-0">
                <img src={activeCompany.logoUrl} alt={activeCompany.companyName} className="max-h-8 max-w-[140px] object-contain" />
              </div>
            ) : (
              <JJLogo size={36} layout="icon-only" bgPureWhite={true} className="shrink-0 shadow-md ring-1 ring-white/30" />
            )}
            <div>
              <h1 className="text-base font-black tracking-tight uppercase flex items-center gap-1.5 leading-none">
                <span className="font-black" style={{ color: '#dc2626' }}>JJ</span>
                <span className="text-white">MUDANÇAS</span>
                <span className="text-[9px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded shadow-xs">
                  SIMULADOR DE MUDANÇA
                </span>
              </h1>
              <p className="text-[10px] text-slate-300 mt-0.5">Simulador de Mudança e Orçamento Online</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {activeCompany.whatsapp && (
              <a 
                href={`https://api.whatsapp.com/send?phone=55${activeCompany.whatsapp.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 hover:bg-white/20 transition-colors bg-white/10 px-3.5 py-2 rounded-xl border border-white/20 font-bold font-mono text-white shadow-xs"
                title="Falar com a JJ Mudanças no WhatsApp"
              >
                <Phone className="h-4 w-4 text-emerald-400" />
                <span className="font-black text-sm tracking-wide">
                  {(() => {
                    const clean = activeCompany.whatsapp.replace(/\D/g, '');
                    if (clean.length === 11) return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
                    if (clean.length === 10) return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
                    return activeCompany.whatsapp;
                  })()}
                </span>
              </a>
            )}

            {/* Admin trigger button */}
            <button
              type="button"
              onClick={loggedCompany ? openAdminModal : openAuthModal}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer border border-white/10"
              title="Acesso Administrativo"
            >
              <ShieldCheck className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        
        {/* Intro / Welcome Banner (Shown only on Step 0 - Cozinha) */}
        {activeStep === 0 && (
          <>
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />
                  Simulador de Mudança - JJ Mudanças
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monte seu inventário cômodo por cômodo, adicione materiais de embalagem e envie seu orçamento direto para o WhatsApp.
                </p>
              </div>
            </div>

            {/* Seletor de Tipo de Imóvel idêntico à captura em linha única */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                QUAL O TIPO DE IMÓVEL DE ORIGEM?
              </p>
              <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                {RESIDENCE_TYPES.map((type) => {
                  const IconComp = type.icon;
                  const isSelected = client.residenceType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setClient({ ...client, residenceType: type.id as any })}
                      className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 sm:gap-3 ${
                        isSelected
                          ? 'border-blue-600 bg-white ring-2 ring-blue-600/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className={`p-2 sm:p-2.5 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? 'bg-blue-600 text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <IconComp className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                      </div>
                      <div className="overflow-hidden min-w-0">
                        <p className="text-xs sm:text-sm font-black text-slate-900 leading-tight truncate">
                          {type.label}
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 leading-tight truncate hidden sm:block">
                          {type.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Section 1: Inventário por Cômodos (Steps 0 to 7) */}
        {activeStep < 8 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="flex items-center justify-center h-7 w-7 rounded-xl bg-red-600 text-white text-xs font-black">
                    {activeStep + 1}
                  </span>
                  {activeStep === 0 ? 'Inventário - Cozinha' : `Inventário - ${ROOM_PRESETS[activeStep]?.name || 'Cômodo'}`}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Etapa {activeStep + 1} de {ROOM_PRESETS.length} cômodos • Adicione os pertences deste ambiente
                </p>
              </div>
            </div>
            <RoomSelector 
              items={selectedItems} 
              onUpdateItems={setSelectedItems} 
              activeRoomId={ROOM_PRESETS[activeStep]?.id || 'cozinha'}
              onSelectRoom={(id) => {
                const idx = ROOM_PRESETS.findIndex(r => r.id === id);
                if (idx !== -1) {
                  setActiveStep(idx);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              onNext={() => {
                setActiveStep(prev => prev + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onPrev={activeStep > 0 ? () => {
                setActiveStep(prev => prev - 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } : undefined}
              nextLabel={activeStep === 7 ? 'Avançar para Materiais & Serviços Extras' : undefined}
              prevLabel={activeStep > 0 ? `Voltar para ${ROOM_PRESETS[activeStep - 1]?.name}` : undefined}
            />
          </section>
        )}

        {/* Section 2: Materiais e Serviços Extras (Step 8) */}
        {activeStep === 8 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="flex items-center justify-center h-7 w-7 rounded-xl bg-red-600 text-white text-xs font-black">2</span>
                  Materiais de Embalagem & Serviços Adicionais
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Escolha caixas, fitas, ajudantes, montador e serviços de embalagem</p>
              </div>
            </div>
            <ServiceSelector 
              materials={materials} 
              services={services} 
              onUpdateMaterials={setMaterials} 
              onUpdateServices={setServices} 
            />
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setActiveStep(7);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors"
              >
                ← Voltar para Caixas & Embalagens
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveStep(9);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-md shadow-red-600/20 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Avançar para Endereços e Rota →
              </button>
            </div>
          </section>
        )}

        {/* Section 3: Endereços de Origem e Destino com Mapa OSM (Step 9) */}
        {activeStep === 9 && (
          <section className="space-y-4" id="address-section">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span className="flex items-center justify-center h-7 w-7 rounded-xl bg-red-600 text-white text-xs font-black">3</span>
                Endereços de Retirada e Entrega
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Informe onde retiramos e onde entregaremos sua mudança</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Origin Address Block */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Endereço de Origem (Retirada)</h3>
                    <p className="text-[11px] text-slate-500">De onde vamos retirar a mudança?</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="origin-cep">CEP de Origem</label>
                    <input
                      type="text"
                      id="origin-cep"
                      placeholder="Ex: 01310-100"
                      value={origin.cep || ''}
                      onChange={(e) => handleCepSearch(e.target.value, true)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 bg-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="origin-street">Rua / Logradouro *</label>
                      <input
                        type="text"
                        id="origin-street"
                        placeholder="Ex: Av. Paulista"
                        required
                        value={origin.address}
                        onChange={(e) => setOrigin({ ...origin, address: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="origin-number">Número *</label>
                      <input
                        type="text"
                        id="origin-number"
                        placeholder="Ex: 1000"
                        required
                        value={origin.number || ''}
                        onChange={(e) => setOrigin({ ...origin, number: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="origin-neighborhood">Bairro</label>
                      <input
                        type="text"
                        id="origin-neighborhood"
                        placeholder="Bela Vista"
                        value={origin.neighborhood || ''}
                        onChange={(e) => setOrigin({ ...origin, neighborhood: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="origin-city">Cidade *</label>
                      <input
                        type="text"
                        id="origin-city"
                        placeholder="São Paulo"
                        required
                        value={origin.city}
                        onChange={(e) => setOrigin({ ...origin, city: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="origin-state">UF *</label>
                      <input
                        type="text"
                        id="origin-state"
                        placeholder="SP"
                        required
                        maxLength={2}
                        value={origin.state}
                        onChange={(e) => setOrigin({ ...origin, state: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 bg-white uppercase font-mono text-center"
                      />
                    </div>
                  </div>

                  {/* Elevador e Andar */}
                  <div className="pt-2 border-t border-slate-200/80 space-y-2.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="origin-floor">Andar</label>
                        <input
                          type="text"
                          id="origin-floor"
                          placeholder="Ex: Térreo, 5º"
                          value={origin.floor || ''}
                          onChange={(e) => setOrigin({ ...origin, floor: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center gap-2 text-xs text-slate-700 font-bold cursor-pointer select-none mt-4">
                          <input
                            type="checkbox"
                            checked={origin.hasElevator || false}
                            onChange={(e) => setOrigin({ ...origin, hasElevator: e.target.checked })}
                            className="h-4 w-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900"
                          />
                          Tem Elevador?
                        </label>
                      </div>
                    </div>

                    {/* Escada Origem */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs text-slate-700 font-bold cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={origin.hasStairs || false}
                          onChange={(e) => setOrigin({ ...origin, hasStairs: e.target.checked, stairsFlights: e.target.checked ? (origin.stairsFlights || 1) : 0 })}
                          className="h-4 w-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900"
                        />
                        Tem Escada na Origem?
                      </label>

                      {origin.hasStairs && (
                        <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                          <span className="text-xs font-bold text-slate-800">Lances de escada:</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setOrigin({ ...origin, stairsFlights: Math.max(1, (origin.stairsFlights || 1) - 1) })}
                              className="h-7 w-7 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center font-bold text-slate-700 text-xs"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-xs font-black font-mono">{origin.stairsFlights || 1}</span>
                            <button
                              type="button"
                              onClick={() => setOrigin({ ...origin, stairsFlights: (origin.stairsFlights || 1) + 1 })}
                              className="h-7 w-7 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center font-bold text-slate-700 text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Destination Address Block */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
                  <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Endereço de Destino (Entrega)</h3>
                    <p className="text-[11px] text-slate-500">Para onde vamos levar seus móveis?</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="dest-cep">CEP de Destino</label>
                    <input
                      type="text"
                      id="dest-cep"
                      placeholder="Ex: 04538-133"
                      value={destination.cep || ''}
                      onChange={(e) => handleCepSearch(e.target.value, false)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 bg-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="dest-street">Rua / Logradouro *</label>
                      <input
                        type="text"
                        id="dest-street"
                        placeholder="Ex: Rua Funchal"
                        required
                        value={destination.address}
                        onChange={(e) => setDestination({ ...destination, address: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="dest-number">Número *</label>
                      <input
                        type="text"
                        id="dest-number"
                        placeholder="Ex: 200"
                        required
                        value={destination.number || ''}
                        onChange={(e) => setDestination({ ...destination, number: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="dest-neighborhood">Bairro</label>
                      <input
                        type="text"
                        id="dest-neighborhood"
                        placeholder="Vila Olímpia"
                        value={destination.neighborhood || ''}
                        onChange={(e) => setDestination({ ...destination, neighborhood: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="dest-city">Cidade *</label>
                      <input
                        type="text"
                        id="dest-city"
                        placeholder="São Paulo"
                        required
                        value={destination.city}
                        onChange={(e) => setDestination({ ...destination, city: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="dest-state">UF *</label>
                      <input
                        type="text"
                        id="dest-state"
                        placeholder="SP"
                        required
                        maxLength={2}
                        value={destination.state}
                        onChange={(e) => setDestination({ ...destination, state: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 bg-white uppercase font-mono text-center"
                      />
                    </div>
                  </div>

                  {/* Elevador e Andar Destino */}
                  <div className="pt-2 border-t border-slate-200/80 space-y-2.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="dest-floor">Andar</label>
                        <input
                          type="text"
                          id="dest-floor"
                          placeholder="Ex: Térreo, 8º"
                          value={destination.floor || ''}
                          onChange={(e) => setDestination({ ...destination, floor: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center gap-2 text-xs text-slate-700 font-bold cursor-pointer select-none mt-4">
                          <input
                            type="checkbox"
                            checked={destination.hasElevator || false}
                            onChange={(e) => setDestination({ ...destination, hasElevator: e.target.checked })}
                            className="h-4 w-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900"
                          />
                          Tem Elevador?
                        </label>
                      </div>
                    </div>

                    {/* Escada Destino */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs text-slate-700 font-bold cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={destination.hasStairs || false}
                          onChange={(e) => setDestination({ ...destination, hasStairs: e.target.checked, stairsFlights: e.target.checked ? (destination.stairsFlights || 1) : 0 })}
                          className="h-4 w-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900"
                        />
                        Tem Escada no Destino?
                      </label>

                      {destination.hasStairs && (
                        <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                          <span className="text-xs font-bold text-slate-800">Lances de escada:</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setDestination({ ...destination, stairsFlights: Math.max(1, (destination.stairsFlights || 1) - 1) })}
                              className="h-7 w-7 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center font-bold text-slate-700 text-xs"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-xs font-black font-mono">{destination.stairsFlights || 1}</span>
                            <button
                              type="button"
                              onClick={() => setDestination({ ...destination, stairsFlights: (destination.stairsFlights || 1) + 1 })}
                              className="h-7 w-7 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center font-bold text-slate-700 text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Rota e Mapa Interativo */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600 animate-pulse" />
                  Cálculo de Distância e Rota no Mapa
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  OSM / OSRM Integrado
                </span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <OSMMap 
                  originCoords={originCoords} 
                  destinationCoords={destinationCoords} 
                  routeGeometry={routeGeometry} 
                />
              </div>

              <div className="space-y-3">
                {isCalculatingRoute ? (
                  <div className="flex items-center gap-2.5 text-xs text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    <svg className="animate-spin h-4 w-4 text-emerald-600 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Localizando endereços e calculando rota rodoviária em tempo real...</span>
                  </div>
                ) : distanceKm ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Distância Estimada</p>
                        <p className="text-base sm:text-lg font-black text-slate-900 font-mono mt-0.5">{distanceKm} km</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Tempo Estimado de Trajeto</p>
                        <p className="text-base sm:text-lg font-black text-slate-900 font-mono mt-0.5">{durationMin ? `~${durationMin} min` : '--'}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <button
                        type="button"
                        onClick={calculateDistance}
                        className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1.5 cursor-pointer bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Recalcular Rota
                      </button>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-600" htmlFor="adjust-dist-input">Ajustar (km):</label>
                        <input
                          type="number"
                          id="adjust-dist-input"
                          step="0.1"
                          placeholder={distanceKm}
                          value={distanceKm}
                          onChange={(e) => setDistanceKm(e.target.value)}
                          className="w-20 px-2 py-1 border border-slate-200 rounded-lg text-center text-xs font-bold font-mono focus:ring-2 focus:ring-slate-900 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-600 bg-white p-4 rounded-xl border border-slate-200 space-y-2.5">
                    <p>Preencha os endereços de <strong>Origem</strong> e <strong>Destino</strong> (rua e número) para calcular a rota e distância automaticamente.</p>
                    {routeError && <p className="text-[11px] text-red-500 font-semibold">⚠️ {routeError}</p>}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={calculateDistance}
                        disabled={!origin.address || !origin.number || !destination.address || !destination.number}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Calcular Rota Agora
                      </button>
                      <div className="flex items-center gap-2 sm:ml-auto">
                        <label className="text-xs font-bold text-slate-700" htmlFor="manual-dist-input">Distância Manual (km):</label>
                        <input
                          type="number"
                          id="manual-dist-input"
                          placeholder="Ex: 15"
                          value={distanceKm}
                          onChange={(e) => setDistanceKm(e.target.value)}
                          className="w-20 px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-slate-900 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setActiveStep(8);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  ← Voltar para Materiais e Serviços
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStep(10);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-md shadow-red-600/20 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Avançar para Seus Dados e Envio →
                </button>
              </div>

            </div>
          </div>
        </section>
        )}

        {/* Section 4: Dados de Contato e Envio Final (Step 10) */}
        {activeStep === 10 && (
          <section className="space-y-4" id="contact-section">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="flex items-center justify-center h-7 w-7 rounded-xl bg-red-600 text-white text-xs font-black">4</span>
                  Seus Dados & Envio do Orçamento
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Preencha seus dados para receber o orçamento completo no WhatsApp</p>
              </div>
            </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              
              {/* Residence Type selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Tipo de Imóvel</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {RESIDENCE_TYPES.map((type) => {
                    const isSelected = client.residenceType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setClient({ ...client, residenceType: type.id as any })}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-1 ring-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="final-client-name">Nome Completo *</label>
                  <input
                    type="text"
                    id="final-client-name"
                    placeholder="Ex: João da Silva"
                    required
                    value={client.name}
                    onChange={(e) => setClient({ ...client, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="final-client-whatsapp">WhatsApp (DDD + Número) *</label>
                  <input
                    type="tel"
                    id="final-client-whatsapp"
                    placeholder="Ex: 11999999999"
                    required
                    value={client.whatsapp}
                    onChange={(e) => setClient({ ...client, whatsapp: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 bg-slate-50/50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="final-client-email">Email (Opcional)</label>
                  <input
                    type="email"
                    id="final-client-email"
                    placeholder="Ex: joao@email.com"
                    value={client.email}
                    onChange={(e) => setClient({ ...client, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="final-client-date">Data Pretendida da Mudança *</label>
                  <input
                    type="date"
                    id="final-client-date"
                    required
                    value={client.moveDate}
                    onChange={(e) => setClient({ ...client, moveDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Observations */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="final-client-obs">Observações Gerais / Detalhes Adicionais</label>
                <textarea
                  id="final-client-obs"
                  rows={2}
                  placeholder="Ex: Preciso de atenção especial com itens frágeis, cristais ou desmontagem de guarda-roupa..."
                  value={client.observations}
                  onChange={(e) => setClient({ ...client, observations: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 bg-slate-50/50 font-medium"
                />
              </div>

              {/* Order Summary Box */}
              <div className="p-5 rounded-2xl bg-[#0a192f] text-white space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/80 pb-3.5">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-red-400" />
                    <span className="font-extrabold text-sm tracking-wide">Resumo da Sua Carga</span>
                  </div>
                  <span className="text-xs text-slate-300 font-mono">
                    {totalItems} {totalItems === 1 ? 'móvel/caixa' : 'móveis/caixas'} selecionados
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Volume Total</p>
                    <p className="text-lg font-black text-white font-mono mt-0.5">{totalVolume.toFixed(2)} m³</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Total Itens</p>
                    <p className="text-lg font-black text-white font-mono mt-0.5">{totalItems} unid.</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Distância</p>
                    <p className="text-lg font-black text-white font-mono mt-0.5">{distanceKm ? `${distanceKm} km` : '--'}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Orçamento</p>
                    <p className="text-base font-black text-emerald-400 mt-0.5">Sob Consulta</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSending}
                id="main-submit-whatsapp-btn"
                className={`w-full py-4 px-6 rounded-xl font-black text-base sm:text-lg text-white transition-all shadow-xl flex items-center justify-center gap-3 cursor-pointer ${
                  isSending 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Enviando Proposta...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>ENVIAR ORÇAMENTO VIA WHATSAPP</span>
                  </>
                )}
              </button>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveStep(9);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  ← Voltar para Endereços e Rota
                </button>
              </div>

            </form>
          </div>
        </section>
        )}

        {/* Reset State Action */}
        {selectedItems.length > 0 && (
          <div className="flex justify-center pt-2 pb-6">
            <button
              type="button"
              id="reset-form-action-btn"
              onClick={handleResetProposal}
              className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer bg-red-50 px-3.5 py-2 rounded-xl border border-red-100"
            >
              Limpar dados e começar do zero
            </button>
          </div>
        )}

        {/* Modal de Resumo da Carga */}
        <InventorySummaryModal 
          isOpen={isSummaryModalOpen} 
          onClose={() => setIsSummaryModalOpen(false)} 
          items={selectedItems} 
          onUpdateItems={setSelectedItems} 
        />

      </main>

      {/* Floating Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Left: Volume & Items info */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 font-mono">
                {totalVolume.toFixed(2)} m³
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-xs font-bold text-slate-600 font-mono">
                {totalItems} {totalItems === 1 ? 'item' : 'itens'}
              </span>
            </div>

            {totalItems > 0 && (
              <button
                type="button"
                onClick={() => setIsSummaryModalOpen(true)}
                className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <ClipboardList className="h-3 w-3" />
                <span>Ver Resumo</span>
              </button>
            )}
          </div>

          {/* Right: Scroll to Submit */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => scrollToSection('address-section')}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              <span>Endereços</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('contact-section')}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Finalizar no WhatsApp</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
