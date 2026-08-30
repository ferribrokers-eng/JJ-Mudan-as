import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON and URLencoded middleware with generous limits for PDF payloads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Helper functions for clients storage
  const CLIENTS_FILE_PATH = path.join(process.cwd(), "data", "clients.json");

  const getClients = () => {
    try {
      if (!fs.existsSync(CLIENTS_FILE_PATH)) {
        const dir = path.dirname(CLIENTS_FILE_PATH);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        const defaultClients = [
          {
            id: "jj-mudancas",
            slug: "jj-mudancas",
            companyName: "JJ Mudanças",
            email: "contato@jjmudancas.com.br",
            password: "123",
            whatsapp: "11959803341",
            logoUrl: "",
            primaryColor: "#0a192f",
            secondaryColor: "#07152b",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        fs.writeFileSync(CLIENTS_FILE_PATH, JSON.stringify(defaultClients, null, 2), "utf-8");
        return defaultClients;
      }
      const data = fs.readFileSync(CLIENTS_FILE_PATH, "utf-8");
      return JSON.parse(data);
    } catch (err) {
      console.error("Error reading clients.json:", err);
      return [];
    }
  };

  const saveClients = (clients: any[]) => {
    try {
      const dir = path.dirname(CLIENTS_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(CLIENTS_FILE_PATH, JSON.stringify(clients, null, 2), "utf-8");
    } catch (err) {
      console.error("Error saving clients.json:", err);
    }
  };

  const sanitizeClient = (client: any) => {
    const { password, ...publicInfo } = client;
    return publicInfo;
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `empresa-${Date.now()}`;
  };

  // --- CLIENTS WHITE-LABEL API ENDPOINTS ---

  // Get single client by slug or id
  app.get("/api/clients/:slug", (req, res) => {
    const clients = getClients();
    const querySlug = req.params.slug.toLowerCase();
    const client = clients.find(
      (c: any) => c.slug.toLowerCase() === querySlug || c.id.toLowerCase() === querySlug
    );

    if (!client) {
      // Fallback to default company
      const defaultClient = clients[0] || {
        id: "jj-mudancas",
        slug: "jj-mudancas",
        companyName: "JJ Mudanças",
        email: "contato@jjmudancas.com.br",
        whatsapp: "11959803341",
        logoUrl: "",
        primaryColor: "#0a192f",
        secondaryColor: "#07152b"
      };
      return res.json(sanitizeClient(defaultClient));
    }

    return res.json(sanitizeClient(client));
  });

  // Get all clients list (public summary)
  app.get("/api/clients", (_req, res) => {
    const clients = getClients();
    return res.json(clients.map(sanitizeClient));
  });

  // Register new client
  app.post("/api/clients/register", (req, res) => {
    try {
      const { email, password, companyName, whatsapp, logoUrl, primaryColor, secondaryColor, slug: customSlug } = req.body;

      if (!email || !password || !companyName || !whatsapp) {
        return res.status(400).json({ error: "Preencha todos os campos obrigatórios (E-mail, Senha, Nome da Empresa e WhatsApp)." });
      }

      const clients = getClients();
      
      // Check existing email
      const existingEmail = clients.find((c: any) => c.email.toLowerCase() === email.toLowerCase().trim());
      if (existingEmail) {
        return res.status(400).json({ error: "Já existe uma empresa cadastrada com este e-mail." });
      }

      // Generate unique slug
      let baseSlug = customSlug ? generateSlug(customSlug) : generateSlug(companyName);
      let slug = baseSlug;
      let counter = 1;

      while (clients.some((c: any) => c.slug === slug || c.id === slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const newClient = {
        id: slug,
        slug,
        email: email.trim(),
        password,
        companyName: companyName.trim(),
        whatsapp: whatsapp.replace(/\D/g, ''),
        logoUrl: logoUrl || '',
        primaryColor: primaryColor || '#1e3a8a',
        secondaryColor: secondaryColor || '#172554',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      clients.push(newClient);
      saveClients(clients);

      console.log(`[White-Label] Nova empresa cadastrada: ${newClient.companyName} (slug: ${newClient.slug})`);

      return res.status(201).json({
        success: true,
        client: sanitizeClient(newClient)
      });
    } catch (err: any) {
      console.error("Erro no cadastro de empresa:", err);
      return res.status(500).json({ error: "Erro interno ao cadastrar empresa." });
    }
  });

  // Login client
  app.post("/api/clients/login", (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Informe e-mail e senha." });
      }

      const clients = getClients();
      const client = clients.find(
        (c: any) => c.email.toLowerCase() === email.toLowerCase().trim() && c.password === password
      );

      if (!client) {
        return res.status(401).json({ error: "E-mail ou senha incorretos." });
      }

      return res.json({
        success: true,
        client: sanitizeClient(client)
      });
    } catch (err: any) {
      console.error("Erro no login de empresa:", err);
      return res.status(500).json({ error: "Erro interno ao realizar login." });
    }
  });

  // Update client information
  app.put("/api/clients/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { email, password, companyName, whatsapp, logoUrl, primaryColor, secondaryColor } = req.body;

      const clients = getClients();
      const index = clients.findIndex((c: any) => c.id === id || c.slug === id);

      if (index === -1) {
        return res.status(404).json({ error: "Empresa não encontrada." });
      }

      const current = clients[index];

      // Check if email is changing and duplicate
      if (email && email.toLowerCase() !== current.email.toLowerCase()) {
        const emailExists = clients.some(
          (c: any, i: number) => i !== index && c.email.toLowerCase() === email.toLowerCase().trim()
        );
        if (emailExists) {
          return res.status(400).json({ error: "Este e-mail já está sendo utilizado por outra empresa." });
        }
      }

      const updated = {
        ...current,
        companyName: companyName ? companyName.trim() : current.companyName,
        email: email ? email.trim() : current.email,
        password: password ? password : current.password,
        whatsapp: whatsapp ? whatsapp.replace(/\D/g, '') : current.whatsapp,
        logoUrl: logoUrl !== undefined ? logoUrl : current.logoUrl,
        primaryColor: primaryColor || current.primaryColor,
        secondaryColor: secondaryColor || current.secondaryColor,
        updatedAt: new Date().toISOString()
      };

      clients[index] = updated;
      saveClients(clients);

      console.log(`[White-Label] Empresa atualizada: ${updated.companyName} (${updated.slug})`);

      return res.json({
        success: true,
        client: sanitizeClient(updated)
      });
    } catch (err: any) {
      console.error("Erro ao atualizar empresa:", err);
      return res.status(500).json({ error: "Erro interno ao atualizar informações da empresa." });
    }
  });

  // Delete client by id or slug
  app.delete("/api/clients/:id", (req, res) => {
    try {
      const { id } = req.params;
      let clients = getClients();
      const initialCount = clients.length;
      
      clients = clients.filter((c: any) => c.id !== id && c.slug !== id);

      if (clients.length === initialCount) {
        return res.status(404).json({ error: "Empresa não encontrada para exclusão." });
      }

      saveClients(clients);
      console.log(`[White-Label] Empresa excluída: ${id}`);

      return res.json({ success: true, message: "Empresa excluída com sucesso." });
    } catch (err: any) {
      console.error("Erro ao excluir empresa:", err);
      return res.status(500).json({ error: "Erro interno ao excluir empresa." });
    }
  });

  // Reset all registered companies (clear test companies)
  app.post("/api/clients/reset", (_req, res) => {
    try {
      const defaultClients = [
        {
          id: "jj-mudancas",
          slug: "jj-mudancas",
          companyName: "JJ Mudanças",
          email: "contato@jjmudancas.com.br",
          password: "123",
          whatsapp: "11959803341",
          logoUrl: "",
          primaryColor: "#1e3a8a",
          secondaryColor: "#172554",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      saveClients(defaultClients);
      console.log("[White-Label] Banco de empresas resetado para padrão.");
      return res.json({ success: true, message: "Cadastros resetados com sucesso.", clients: defaultClients.map(sanitizeClient) });
    } catch (err: any) {
      console.error("Erro ao resetar empresas:", err);
      return res.status(500).json({ error: "Erro interno ao resetar empresas." });
    }
  });



  // Enable CORS globally so the -dev- environment can communicate with the -pre- (production/preview) server
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // In-memory store for generated PDFs (lasts until server restarts or cleans up)
  const pdfStorage = new Map<
    string,
    {
      buffer: Buffer;
      filename: string;
      createdAt: number;
      clientName?: string;
      origin?: string;
      destination?: string;
      totalItems?: number;
    }
  >();

  // Periodically clean up PDFs older than 24 hours (runs every hour)
  setInterval(() => {
    const now = Date.now();
    for (const [id, data] of pdfStorage.entries()) {
      if (now - data.createdAt > 24 * 60 * 60 * 1000) {
        pdfStorage.delete(id);
      }
    }
  }, 60 * 60 * 1000);

  // API endpoint to upload generated PDF with optional metadata
  app.post("/api/pdf", (req, res) => {
    try {
      const { pdfBase64, filename, clientName, origin, destination, totalItems } = req.body;
      if (!pdfBase64) {
        return res.status(400).json({ error: "Faltando o parâmetro pdfBase64" });
      }

      // Generate a unique alphanumeric ID
      const id = Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8);
      const buffer = Buffer.from(pdfBase64, "base64");

      pdfStorage.set(id, {
        buffer,
        filename: filename || `inventario_${id}.pdf`,
        createdAt: Date.now(),
        clientName,
        origin,
        destination,
        totalItems
      });

      console.log(`[PDF Storage] PDF salvo com id: ${id}. Cliente: ${clientName || 'N/A'}`);
      res.json({ success: true, id });
    } catch (err: any) {
      console.error("Erro ao salvar PDF:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // API endpoint to view/download PDF by ID
  app.get("/api/pdf/:id", (req, res) => {
    try {
      const id = req.params.id;
      const pdf = pdfStorage.get(id);

      if (!pdf) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.status(404).send(`
          <div style="font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 50px; color: #334155; max-width: 500px; margin: 40px auto; border-radius: 24px; border: 1px solid #e2e8f0; background: white; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
            <div style="font-size: 4rem; margin-bottom: 20px;">⚠️</div>
            <h1 style="color: #ef4444; font-size: 1.8rem; margin-bottom: 10px; font-weight: 800;">PDF Não Encontrado</h1>
            <p style="font-size: 1rem; color: #64748b; line-height: 1.6; margin-bottom: 20px;">Este link de PDF expirou ou não está mais disponível no servidor.</p>
            <p style="font-size: 0.85rem; color: #94a3b8; border-t: 1px solid #f1f5f9; padding-top: 15px;">Por favor, acesse o painel <strong>Mudança Fácil</strong> e envie novamente a sua solicitação.</p>
          </div>
        `);
      }

      // If downloading is requested explicitly (?download=true)
      if (req.query.download === "true") {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${pdf.filename}"`);
        return res.send(pdf.buffer);
      }

      // If inline view is requested (?inline=true)
      if (req.query.inline === "true") {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${pdf.filename}"`);
        return res.send(pdf.buffer);
      }

      // Beautiful responsive HTML Landing Page optimized for WhatsApp in-app browser and mobile devices
      const dateStr = new Date(pdf.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Inventário de Mudança - Mudança Fácil</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;950&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Inter', sans-serif;
            }
          </style>
        </head>
        <body class="bg-slate-50 text-slate-900 min-h-screen flex flex-col justify-between">
          <div class="w-full max-w-md mx-auto px-4 py-10 flex-grow flex flex-col justify-center">
            
            <!-- Logo Header -->
            <div class="text-center mb-8">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-900 rounded-2xl shadow-xl shadow-blue-900/20 text-white text-3xl mb-3">
                🚚
              </div>
              <h1 class="text-2xl font-black tracking-tight text-slate-900">Mudança Fácil</h1>
              <p class="text-[10px] font-extrabold text-blue-900 uppercase tracking-wider mt-1">Simulador & Inventário de Mudanças</p>
            </div>

            <!-- Main Card -->
            <div class="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 p-6 space-y-6">
              <div class="border-b border-slate-100 pb-4 text-center">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-green-50 text-green-700">
                  <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Documento Disponível
                </span>
                <h2 class="text-lg font-black text-slate-800 mt-3">Inventário de Mudança Oficial</h2>
                <p class="text-[10px] text-slate-400 font-mono mt-1">Ref: #${id.toUpperCase()}</p>
              </div>

              <!-- Metadata Summary -->
              <div class="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100/80 text-sm">
                ${pdf.clientName ? `
                <div class="flex justify-between items-center">
                  <span class="text-slate-500 font-medium text-xs">👤 Cliente</span>
                  <span class="text-slate-800 font-extrabold">${pdf.clientName}</span>
                </div>
                ` : ''}
                
                ${pdf.totalItems ? `
                <div class="flex justify-between items-center">
                  <span class="text-slate-500 font-medium text-xs">📦 Volume da Carga</span>
                  <span class="text-slate-800 font-extrabold">${pdf.totalItems} itens cadastrados</span>
                </div>
                ` : ''}

                ${pdf.origin && pdf.destination ? `
                <div class="flex justify-between items-start gap-4">
                  <span class="text-slate-500 font-medium text-xs whitespace-nowrap mt-0.5">🛣️ Trajeto</span>
                  <span class="text-slate-800 font-extrabold text-right text-xs leading-normal">
                    ${pdf.origin} ➔ ${pdf.destination}
                  </span>
                </div>
                ` : ''}

                <div class="flex justify-between items-center border-t border-slate-200/60 pt-2.5 mt-2">
                  <span class="text-slate-500 font-medium text-xs">📅 Data de Geração</span>
                  <span class="text-slate-600 font-semibold text-xs">${dateStr}</span>
                </div>
              </div>

              <!-- CTA Buttons -->
              <div class="space-y-3">
                <a 
                  href="/api/pdf/${id}?inline=true" 
                  target="_blank"
                  class="w-full py-4 px-6 bg-blue-900 hover:bg-blue-950 active:bg-slate-950 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 text-center text-sm"
                >
                  👁️ Abrir / Visualizar PDF
                </a>
                
                <a 
                  href="/api/pdf/${id}?download=true" 
                  class="w-full py-3 px-6 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-center text-xs"
                >
                  📥 Baixar Arquivo PDF
                </a>
              </div>

              <!-- Extra guidance -->
              <p class="text-[10px] text-slate-400 text-center leading-relaxed">
                Este inventário lista detalhadamente todos os móveis, caixas, materiais e serviços adicionais para elaboração de orçamento.
              </p>
            </div>

          </div>

          <!-- Footer -->
          <div class="pb-8 text-center text-[11px] text-slate-400">
            © ${new Date().getFullYear()} Mudança Fácil. Todos os direitos reservados.
          </div>
        </body>
        </html>
      `);
    } catch (err: any) {
      console.error("Erro ao recuperar PDF:", err);
      res.status(500).send("Erro interno ao recuperar o arquivo PDF.");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
