import React from 'react';
import { ClientInfo } from '../types';
import { User, Phone, Mail, Calendar, Home, FileText } from 'lucide-react';

interface ContactFormProps {
  client: ClientInfo;
  onChangeClient: (client: ClientInfo) => void;
}

export default function ContactForm({ client, onChangeClient }: ContactFormProps) {

  const handleUpdate = (field: keyof ClientInfo, value: any) => {
    onChangeClient({ ...client, [field]: value });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6" id="contact-form-container">
      <div>
        <h3 className="text-lg font-bold text-slate-900">3. Informações de Contato e Data</h3>
        <p className="text-xs text-slate-500">Insira seus dados pessoais para registrar o inventário e programar o frete.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Client Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="client-name">Seu Nome Completo *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              id="client-name"
              placeholder="Ex: João Silva Santos"
              required
              value={client.name}
              onChange={(e) => handleUpdate('name', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-slate-50/30"
            />
          </div>
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="client-whatsapp">WhatsApp de Contato (DDD + Número) *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="tel"
              id="client-whatsapp"
              placeholder="Ex: 11999999999"
              required
              value={client.whatsapp}
              onChange={(e) => {
                // Keep only numbers
                const num = e.target.value.replace(/\D/g, '');
                handleUpdate('whatsapp', num);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-slate-50/30 font-mono"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Insira somente os números do WhatsApp com o DDD.</p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="client-email">E-mail (Para receber a cópia da proposta)</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="email"
              id="client-email"
              placeholder="Ex: joao.silva@gmail.com"
              value={client.email}
              onChange={(e) => handleUpdate('email', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-slate-50/30"
            />
          </div>
        </div>

        {/* Moving Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="client-date">Data Pretendida para a Mudança *</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="date"
              id="client-date"
              required
              value={client.moveDate}
              onChange={(e) => handleUpdate('moveDate', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-slate-50/30 font-mono"
            />
          </div>
        </div>

        {/* Residence Type Selector */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-2">Categoria da Residência Atual *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'casa', name: 'Casa / Sobrado' },
              { id: 'apartamento', name: 'Apartamento' },
              { id: 'comercial', name: 'Escritório' },
              { id: 'loja', name: 'Loja / Ponto' }
            ].map((item) => (
              <button
                type="button"
                key={item.id}
                id={`res-type-${item.id}`}
                onClick={() => handleUpdate('residenceType', item.id)}
                className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                  client.residenceType === item.id
                    ? 'border-blue-900 bg-blue-950/10 text-blue-950 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700 bg-white'
                }`}
              >
                <Home className="h-4 w-4 mx-auto mb-1.5 text-slate-500" />
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* Client Observations / Instructions */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="client-obs">Observações Importantes e Cuidados Especiais</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <textarea
              id="client-obs"
              rows={3}
              placeholder="Descreva itens de extrema delicadeza, restrições de horários de condomínio, se há necessidade de estacionamento fechado, etc."
              value={client.observations}
              onChange={(e) => handleUpdate('observations', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-slate-50/30"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
