import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  X, 
  Trash2, 
  RotateCcw, 
  Building2, 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  Phone, 
  Mail, 
  Calendar, 
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { CompanyClient } from '../types';

export default function AdminPanel() {
  const { 
    isAdminOpen, 
    closeAdminModal, 
    getAllCompanies, 
    deleteCompany, 
    resetCompanies,
    loadCompanyBySlug
  } = useCompany();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  const [companies, setCompanies] = useState<CompanyClient[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingList, setIsLoadingList] = useState<boolean>(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Deletion confirmation state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    if (isAdminOpen) {
      if (isAuthenticated) {
        fetchCompanies();
      }
    } else {
      setActionMsg(null);
      setDeletingId(null);
      setShowResetConfirm(false);
    }
  }, [isAdminOpen, isAuthenticated]);

  const fetchCompanies = async () => {
    setIsLoadingList(true);
    const list = await getAllCompanies();
    setCompanies(list);
    setIsLoadingList(false);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin' || passwordInput === 'admin123' || passwordInput === '123456') {
      setIsAuthenticated(true);
      setAuthError('');
      fetchCompanies();
    } else {
      setAuthError('Senha de administrador incorreta. Tente "admin" ou "admin123".');
    }
  };

  const handleDeleteCompany = async (id: string) => {
    setActionMsg(null);
    const res = await deleteCompany(id);
    if (res.success) {
      setActionMsg({ type: 'success', text: 'Empresa excluída com sucesso!' });
      setDeletingId(null);
      fetchCompanies();
    } else {
      setActionMsg({ type: 'error', text: res.error || 'Erro ao excluir empresa.' });
    }
  };

  const handleResetAll = async () => {
    setActionMsg(null);
    const res = await resetCompanies();
    if (res.success) {
      setActionMsg({ type: 'success', text: 'Todos os cadastros foram zerados com sucesso!' });
      setShowResetConfirm(false);
      fetchCompanies();
    } else {
      setActionMsg({ type: 'error', text: res.error || 'Erro ao zerar cadastros.' });
    }
  };

  const getCompanyShortUrl = (slug: string) => {
    return `${window.location.origin}/${slug}`;
  };

  const copyLink = (slug: string) => {
    const link = getCompanyShortUrl(slug);
    navigator.clipboard.writeText(link);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const filteredCompanies = companies.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.companyName?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.slug?.toLowerCase().includes(q) ||
      c.whatsapp?.includes(q)
    );
  });

  if (!isAdminOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                  Painel de Administração <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 font-extrabold px-2 py-0.5 rounded-md uppercase">Super Admin</span>
                </h2>
                <p className="text-xs text-slate-300 font-medium">Gerenciamento completo de empresas cadastradas e links curtos</p>
              </div>
            </div>

            <button
              onClick={closeAdminModal}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ADMIN LOGIN LOCK SCREEN */}
          {!isAuthenticated ? (
            <div className="p-8 flex flex-col items-center justify-center max-w-md mx-auto my-auto text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-blue-900/10 text-blue-950 flex items-center justify-center shadow-inner">
                <Lock className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">Acesso Restrito ao Administrador</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Digite a senha de administrador para visualizar a lista de empresas cadastradas e gerenciar cadastros.
                </p>
              </div>

              {authError && (
                <div className="w-full p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="w-full space-y-4">
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    placeholder="Senha do Administrador (ex: admin)"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Entrar no Painel Admin
                </button>
              </form>
              <p className="text-[11px] text-slate-400">Dica: Senha padrão é <strong>admin</strong></p>
            </div>
          ) : (
            /* ADMIN MAIN DASHBOARD */
            <div className="p-6 overflow-y-auto space-y-6 flex-1">

              {/* Action Banner Message */}
              {actionMsg && (
                <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold animate-fadeIn ${
                  actionMsg.type === 'success' 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <span className="flex items-center gap-2">
                    {actionMsg.type === 'success' ? <Check className="w-4 h-4 text-green-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
                    {actionMsg.text}
                  </span>
                  <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Stats & Search Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Companies Card */}
                <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-bold shadow-md shadow-blue-900/20">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total de Empresas</span>
                    <h3 className="text-2xl font-black text-slate-900">{companies.length}</h3>
                  </div>
                </div>

                {/* Reset Database Trigger Card */}
                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl flex items-center justify-between md:col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Zerar Cadastros de Teste</h4>
                      <p className="text-[11px] text-slate-600">Limpe os testes e restaure o banco de empresas ao estado padrão.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Zerar Tudo
                  </button>
                </div>
              </div>

              {/* Search & Refresh Control */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Buscar empresa, e-mail ou WhatsApp..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={fetchCompanies}
                    disabled={isLoadingList}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingList ? 'animate-spin' : ''}`} />
                    Atualizar Lista
                  </button>
                </div>
              </div>

              {/* COMPANIES LIST TABLE */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                {isLoadingList ? (
                  <div className="p-12 text-center text-slate-400 text-xs font-semibold space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-900" />
                    <p>Carregando empresas cadastradas...</p>
                  </div>
                ) : filteredCompanies.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs font-medium">
                    Nenhuma empresa encontrada com os critérios de busca.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                          <th className="py-3 px-4">Empresa</th>
                          <th className="py-3 px-4">Contato / WhatsApp</th>
                          <th className="py-3 px-4">Link Curto Exclusivo</th>
                          <th className="py-3 px-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredCompanies.map((comp) => {
                          const shortUrl = getCompanyShortUrl(comp.slug);

                          return (
                            <tr key={comp.id} className="hover:bg-slate-50/60 transition-colors">
                              {/* Company Info */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  {comp.logoUrl ? (
                                    <div className="w-9 h-9 rounded-xl border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden">
                                      <img src={comp.logoUrl} alt={comp.companyName} className="max-h-full max-w-full object-contain" />
                                    </div>
                                  ) : (
                                    <div 
                                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-xs"
                                      style={{ backgroundColor: comp.primaryColor || '#1e3a8a' }}
                                    >
                                      {comp.companyName?.substring(0, 1).toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="font-extrabold text-slate-900 leading-tight">{comp.companyName}</h4>
                                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                      <Mail className="w-3 h-3 text-slate-400" />
                                      {comp.email}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* WhatsApp Contact */}
                              <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                                {comp.whatsapp ? (
                                  <a
                                    href={`https://api.whatsapp.com/send?phone=55${comp.whatsapp.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg transition-colors text-[11px]"
                                  >
                                    <Phone className="w-3 h-3 text-green-600" />
                                    <span>{comp.whatsapp}</span>
                                  </a>
                                ) : (
                                  <span className="text-slate-400 font-normal">Não informado</span>
                                )}
                              </td>

                              {/* Short URL */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[11px] font-bold text-blue-950 bg-blue-900/10 px-2.5 py-1 rounded-lg border border-blue-900/20 truncate max-w-[200px]">
                                    /{comp.slug}
                                  </span>
                                  <button
                                    onClick={() => copyLink(comp.slug)}
                                    title="Copiar Link Curto"
                                    className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
                                  >
                                    {copiedSlug === comp.slug ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                  <a
                                    href={`/${comp.slug}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Abrir em Nova Aba"
                                    className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => {
                                      loadCompanyBySlug(comp.slug);
                                      closeAdminModal();
                                    }}
                                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition-colors"
                                  >
                                    Visualizar
                                  </button>

                                  <button
                                    onClick={() => setDeletingId(comp.id)}
                                    title="Excluir Empresa"
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* CONFIRMATION MODAL: DELETE SINGLE COMPANY */}
          {deletingId && (
            <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 text-center"
              >
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Excluir Empresa?</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Esta ação removerá permanentemente o cadastro da empresa e desativará o link curto correspondente.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setDeletingId(null)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDeleteCompany(deletingId)}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md"
                  >
                    Confirmar Exclusão
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* CONFIRMATION MODAL: RESET ALL */}
          {showResetConfirm && (
            <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-100 text-center"
              >
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Zerar Todos os Cadastros?</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Isso limpara todas as empresas cadastradas e restaurará o banco de dados para o estado inicial padrão.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleResetAll}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md"
                  >
                    Zerar Banco de Dados
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500">
            <span>Sistema White-Label Mudança Fácil &bull; Painel de Controle</span>
            <button
              onClick={closeAdminModal}
              className="text-slate-600 hover:text-slate-900 font-bold"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
