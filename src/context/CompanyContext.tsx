import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CompanyClient } from '../types';

interface CompanyContextType {
  activeCompany: CompanyClient;
  loggedCompany: CompanyClient | null;
  isLoading: boolean;
  error: string | null;
  loadCompanyBySlug: (slug: string) => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerCompany: (data: Partial<CompanyClient>) => Promise<{ success: boolean; error?: string; client?: CompanyClient }>;
  updateCompany: (id: string, data: Partial<CompanyClient>) => Promise<{ success: boolean; error?: string; client?: CompanyClient }>;
  deleteCompany: (id: string) => Promise<{ success: boolean; error?: string }>;
  resetCompanies: () => Promise<{ success: boolean; error?: string }>;
  getAllCompanies: () => Promise<CompanyClient[]>;
  logout: () => void;
  openAuthModal: (mode?: 'login' | 'register' | 'panel') => void;
  closeAuthModal: () => void;
  authModalState: { isOpen: boolean; mode: 'login' | 'register' | 'panel' };
  isAdminOpen: boolean;
  openAdminModal: () => void;
  closeAdminModal: () => void;
}

const DEFAULT_COMPANY: CompanyClient = {
  id: 'jj-mudancas',
  slug: 'jj-mudancas',
  companyName: 'JJ Mudanças',
  email: 'contato@jjmudancas.com.br',
  whatsapp: '11959803341',
  logoUrl: '',
  primaryColor: '#0a192f',
  secondaryColor: '#07152b'
};

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeCompany, setActiveCompany] = useState<CompanyClient>(DEFAULT_COMPANY);
  const [loggedCompany, setLoggedCompany] = useState<CompanyClient | null>(() => {
    try {
      const saved = localStorage.getItem('loggedCompanySession');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.primaryColor === '#1e3a8a' || parsed.primaryColor === '#2563eb' || parsed.primaryColor === '#3b82f6' || parsed.primaryColor === '#1e40af') {
          parsed.primaryColor = '#0a192f';
          parsed.secondaryColor = '#07152b';
          localStorage.setItem('loggedCompanySession', JSON.stringify(parsed));
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode: 'login' | 'register' | 'panel' }>({
    isOpen: false,
    mode: 'login'
  });

  const openAuthModal = (mode: 'login' | 'register' | 'panel' = 'login') => {
    setAuthModalState({ isOpen: true, mode });
  };

  const closeAuthModal = () => {
    setAuthModalState(prev => ({ ...prev, isOpen: false }));
  };

  // Helper function to update CSS custom variables
  const applyCompanyTheme = (company: CompanyClient) => {
    const root = document.documentElement;
    let pColor = company.primaryColor || '#0a192f';
    let sColor = company.secondaryColor || '#07152b';

    // Normalize any stale light blue values to dark navy
    if (pColor === '#1e3a8a' || pColor === '#2563eb' || pColor === '#3b82f6' || pColor === '#1e40af') {
      pColor = '#0a192f';
    }
    if (sColor === '#172554' || sColor === '#1e3a8a') {
      sColor = '#07152b';
    }

    root.style.setProperty('--color-primary', pColor);
    root.style.setProperty('--color-secondary', sColor);
  };

  // Fetch company by slug
  const loadCompanyBySlug = async (slug: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/clients/${encodeURIComponent(slug)}`);
      if (res.ok) {
        const data: CompanyClient = await res.json();
        setActiveCompany(data);
        applyCompanyTheme(data);
      } else {
        setActiveCompany(DEFAULT_COMPANY);
        applyCompanyTheme(DEFAULT_COMPANY);
      }
    } catch (err) {
      console.error("Failed to fetch company theme:", err);
      setActiveCompany(DEFAULT_COMPANY);
      applyCompanyTheme(DEFAULT_COMPANY);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load: parse URL parameters (e.g. ?cliente=empresa-exemplo) or short path (e.g. /empresa-exemplo)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let slugParam = params.get('cliente') || params.get('c');

    if (!slugParam) {
      const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '');
      if (rawPath && !rawPath.includes('.') && !rawPath.startsWith('api')) {
        slugParam = rawPath;
      }
    }

    if (slugParam) {
      loadCompanyBySlug(slugParam);
    } else if (loggedCompany) {
      // If no query param or path, but user is logged in, use their company branding
      setActiveCompany(loggedCompany);
      applyCompanyTheme(loggedCompany);
      setIsLoading(false);
    } else {
      loadCompanyBySlug('jj-mudancas');
    }
  }, []);

  // Sync theme when active company changes
  useEffect(() => {
    if (activeCompany) {
      applyCompanyTheme(activeCompany);
    }
  }, [activeCompany]);

  // Login handler
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/clients/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLoggedCompany(data.client);
        setActiveCompany(data.client);
        applyCompanyTheme(data.client);
        localStorage.setItem('loggedCompanySession', JSON.stringify(data.client));
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Falha ao efetuar login' };
      }
    } catch (err: any) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  };

  // Register handler
  const registerCompany = async (formData: Partial<CompanyClient>) => {
    try {
      const res = await fetch('/api/clients/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLoggedCompany(data.client);
        setActiveCompany(data.client);
        applyCompanyTheme(data.client);
        localStorage.setItem('loggedCompanySession', JSON.stringify(data.client));
        
        // Update URL to include the new slug parameter
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('cliente', data.client.slug);
        window.history.pushState({}, '', newUrl.toString());

        return { success: true, client: data.client };
      } else {
        return { success: false, error: data.error || 'Erro ao cadastrar empresa' };
      }
    } catch (err) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  };

  // Update handler
  const updateCompany = async (id: string, formData: Partial<CompanyClient>) => {
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLoggedCompany(data.client);
        setActiveCompany(data.client);
        applyCompanyTheme(data.client);
        localStorage.setItem('loggedCompanySession', JSON.stringify(data.client));
        return { success: true, client: data.client };
      } else {
        return { success: false, error: data.error || 'Erro ao atualizar informações' };
      }
    } catch (err) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  };

  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  const openAdminModal = () => setIsAdminOpen(true);
  const closeAdminModal = () => setIsAdminOpen(false);

  // Delete handler
  const deleteCompany = async (id: string) => {
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (loggedCompany?.id === id || loggedCompany?.slug === id) {
          setLoggedCompany(null);
          localStorage.removeItem('loggedCompanySession');
          loadCompanyBySlug('jj-mudancas');
        }
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Erro ao excluir empresa' };
      }
    } catch (err) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  };

  // Reset handler
  const resetCompanies = async () => {
    try {
      const res = await fetch('/api/clients/reset', {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLoggedCompany(null);
        localStorage.removeItem('loggedCompanySession');
        loadCompanyBySlug('jj-mudancas');
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Erro ao resetar cadastro' };
      }
    } catch (err) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  };

  // Get all companies handler
  const getAllCompanies = async (): Promise<CompanyClient[]> => {
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch (err) {
      console.error('Erro ao buscar lista de empresas:', err);
      return [];
    }
  };

  // Logout handler
  const logout = () => {
    setLoggedCompany(null);
    localStorage.removeItem('loggedCompanySession');
    loadCompanyBySlug('mudanca-facil');
  };

  return (
    <CompanyContext.Provider
      value={{
        activeCompany,
        loggedCompany,
        isLoading,
        error,
        loadCompanyBySlug,
        login,
        registerCompany,
        updateCompany,
        deleteCompany,
        resetCompanies,
        getAllCompanies,
        logout,
        openAuthModal,
        closeAuthModal,
        authModalState,
        isAdminOpen,
        openAdminModal,
        closeAdminModal
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany deve ser usado dentro de um CompanyProvider');
  }
  return context;
};
