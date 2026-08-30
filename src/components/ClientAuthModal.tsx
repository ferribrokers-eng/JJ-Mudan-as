import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Building2, 
  Mail, 
  Lock, 
  Phone, 
  Palette, 
  Upload, 
  Check, 
  Copy, 
  ExternalLink, 
  LogOut, 
  Sparkles, 
  AlertCircle,
  Eye,
  EyeOff,
  Image as ImageIcon,
  ChevronRight,
  User,
  Settings
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';

export default function ClientAuthModal() {
  const { 
    authModalState, 
    closeAuthModal, 
    loggedCompany, 
    activeCompany,
    login, 
    registerCompany, 
    updateCompany, 
    logout,
    openAdminModal
  } = useCompany();

  const [mode, setMode] = useState<'login' | 'register' | 'panel'>(
    loggedCompany ? 'panel' : authModalState.mode
  );

  useEffect(() => {
    if (authModalState.isOpen) {
      if (loggedCompany && authModalState.mode === 'login') {
        setMode('panel');
      } else {
        setMode(authModalState.mode);
      }
    }
  }, [authModalState, loggedCompany]);

  // Login Form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register / Edit Form state
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#0a192f');
  const [secondaryColor, setSecondaryColor] = useState('#07152b');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form when editing or switching mode
  useEffect(() => {
    if (loggedCompany) {
      setCompanyName(loggedCompany.companyName || '');
      setEmail(loggedCompany.email || '');
      setWhatsapp(loggedCompany.whatsapp || '');
      setLogoUrl(loggedCompany.logoUrl || '');
      setPrimaryColor(loggedCompany.primaryColor || '#0a192f');
      setSecondaryColor(loggedCompany.secondaryColor || '#07152b');
      setPassword('');
    } else {
      setPrimaryColor('#0a192f');
      setSecondaryColor('#07152b');
    }
    setErrorMsg('');
    setSuccessMsg('');
  }, [mode, loggedCompany]);

  if (!authModalState.isOpen) return null;

  // Handle Logo file upload (base64 reader)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('A imagem deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoUrl(reader.result as string);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const res = await login(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (res.success) {
      setMode('panel');
      setLoginPassword('');
    } else {
      setErrorMsg(res.error || 'Erro ao fazer login.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!companyName.trim()) {
      setErrorMsg('Informe o nome da empresa.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Informe um e-mail válido.');
      return;
    }

    if (!password || password.length < 3) {
      setErrorMsg('A senha deve ter pelo menos 3 caracteres.');
      return;
    }

    if (!whatsapp.trim() || whatsapp.replace(/\D/g, '').length < 8) {
      setErrorMsg('Informe um número de WhatsApp com DDD válido.');
      return;
    }

    setIsSubmitting(true);

    const res = await registerCompany({
      companyName,
      email,
      password,
      whatsapp,
      logoUrl,
      primaryColor,
      secondaryColor
    });

    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg('Empresa cadastrada com sucesso!');
      setMode('panel');
    } else {
      setErrorMsg(res.error || 'Erro ao realizar cadastro.');
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedCompany) return;

    setErrorMsg('');
    setSuccessMsg('');

    if (!companyName.trim()) {
      setErrorMsg('Informe o nome da empresa.');
      return;
    }

    if (!whatsapp.trim()) {
      setErrorMsg('Informe o número do WhatsApp.');
      return;
    }

    setIsSubmitting(true);

    const payload: any = {
      companyName,
      email,
      whatsapp,
      logoUrl,
      primaryColor,
      secondaryColor
    };

    if (password) {
      payload.password = password;
    }

    const res = await updateCompany(loggedCompany.id, payload);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg('Informações atualizadas com sucesso!');
      setPassword('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(res.error || 'Erro ao atualizar.');
    }
  };

  const getCompanyLink = () => {
    const slug = loggedCompany?.slug || activeCompany.slug || 'mudanca-facil';
    return `${window.location.origin}/${slug}`;
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(getCompanyLink());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-md"
                style={{ backgroundColor: activeCompany.primaryColor || '#1e3a8a' }}
              >
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800 leading-tight">
                  {mode === 'panel' ? 'Painel da Empresa' : mode === 'register' ? 'Cadastrar Empresa (White-Label)' : 'Acesso da Empresa'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {mode === 'panel' 
                    ? 'Personalize suas cores, logo e WhatsApp' 
                    : mode === 'register' 
                    ? 'Crie seu simulador de mudanças com sua própria marca' 
                    : 'Acesse para gerenciar sua personalização'}
                </p>
              </div>
            </div>

            <button
              onClick={closeAuthModal}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Mode Switcher */}
          <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 gap-1 text-xs font-bold">
            {!loggedCompany ? (
              <>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMsg(''); }}
                  className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    mode === 'register' 
                      ? 'bg-white text-slate-900 shadow-sm font-extrabold border border-slate-200/60' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-900" />
                  Cadastrar Empresa
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(''); }}
                  className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    mode === 'login' 
                      ? 'bg-white text-slate-900 shadow-sm font-extrabold border border-slate-200/60' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  Entrar / Login
                </button>
              </>
            ) : (
              <div className="w-full flex items-center justify-between px-3 py-1">
                <span className="text-slate-600 font-extrabold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Logado como: <strong className="text-slate-900">{loggedCompany.companyName}</strong>
                </span>
                <button
                  onClick={logout}
                  className="text-red-600 hover:text-red-700 font-bold text-xs flex items-center gap-1 hover:underline"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sair
                </button>
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1">

            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200/80 rounded-2xl flex items-start gap-3 text-red-700 text-xs font-semibold animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-green-50 border border-green-200/80 rounded-2xl flex items-start gap-3 text-green-700 text-xs font-semibold animate-fadeIn">
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {mode === 'login' && !loggedCompany && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">E-mail da Empresa</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="empresa@exemplo.com.br"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Senha</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Sua senha"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-950 text-white font-black text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Acessando...' : 'Entrar no Painel'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* REGISTER & EDIT PANEL FORM */}
            {(mode === 'register' || mode === 'panel') && (
              <form onSubmit={mode === 'panel' ? handleUpdateSubmit : handleRegisterSubmit} className="space-y-4">
                
                {/* Live Link Box if logged in */}
                {mode === 'panel' && loggedCompany && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <span className="text-[11px] font-black uppercase text-slate-950 tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Seu Link Exclusivo de Simulador
                    </span>
                    <p className="text-xs text-slate-600">
                      Compartilhe este link com seus clientes. O simulador será aberto com o seu logo, cores e WhatsApp.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        readOnly
                        value={getCompanyLink()}
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 font-semibold focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={copyLinkToClipboard}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedLink ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Company Name */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Nome da Empresa *</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mudanças Rápidas & Logística"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                    />
                  </div>
                </div>

                {/* Grid Email & WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">E-mail de Login *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="empresa@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">WhatsApp (com DDD) *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Ex: 11999998888"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    {mode === 'panel' ? 'Senha (deixe em branco se não quiser alterar)' : 'Senha de Acesso *'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={mode === 'register'}
                      placeholder={mode === 'panel' ? 'Nova senha opcional' : 'Crie uma senha'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Logo Upload Section */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Logo da Empresa (Upload de Imagem)</span>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="text-red-500 hover:text-red-600 font-bold text-[10px]"
                      >
                        Remover Logo
                      </button>
                    )}
                  </label>

                  <div className="flex items-center gap-4">
                    {logoUrl ? (
                      <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center p-2 shrink-0 overflow-hidden shadow-sm">
                        <img src={logoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 shrink-0">
                        <ImageIcon className="w-6 h-6 mb-1" />
                        <span className="text-[9px] font-bold">Sem Logo</span>
                      </div>
                    )}

                    <div className="flex-1 space-y-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        {logoUrl ? 'Trocar Logotipo' : 'Selecionar Arquivo de Logo'}
                      </button>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Formatos suportados: PNG, JPG, WEBP ou SVG (Máx. 5MB). Aparecerá no cabeçalho e relatórios PDF.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Color Pickers Section */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="block text-xs font-extrabold text-slate-700 mb-2 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-blue-900" />
                    Cores Personalizadas do Seu App
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Primary Color */}
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-700">Cor Primária</span>
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">{primaryColor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
                        />
                        <span className="text-[11px] text-slate-500">Usada em botões principais, cabeçalho e destaques.</span>
                      </div>
                    </div>

                    {/* Secondary Color */}
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-700">Cor Secundária</span>
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">{secondaryColor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
                        />
                        <span className="text-[11px] text-slate-500">Usada em seleções secundárias e badges.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 text-white font-black text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: primaryColor || '#1e3a8a' }}
                  >
                    {isSubmitting
                      ? 'Salvando...'
                      : mode === 'panel'
                      ? 'Atualizar Configurações da Empresa'
                      : 'Cadastrar Minha Empresa'}
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>

              </form>
            )}

          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500">
            <span>Plataforma Mudança Fácil White-Label</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  closeAuthModal();
                  openAdminModal();
                }}
                className="text-amber-600 hover:text-amber-700 font-extrabold flex items-center gap-1"
              >
                Área do Administrador
              </button>
              <button
                onClick={closeAuthModal}
                className="text-slate-600 hover:text-slate-900 font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
