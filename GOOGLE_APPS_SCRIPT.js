/**
 * ==============================================================================
 *                       SISTEMA "MUDANÇA FÁCIL" - BACKEND GRATUITO
 *                  INTEGRAÇÃO COM GOOGLE SHEETS, DRIVE E GERADOR DE PDF
 * ==============================================================================
 * 
 * Este arquivo contém o código completo que deve ser copiado e colado no seu
 * Google Apps Script. Ele serve como o servidor (Web App) que recebe os dados
 * do site, salva na planilha, guarda as imagens no Drive, gera um PDF profissional
 * e retorna o link de visualização para o cliente enviar no WhatsApp.
 * 
 * --- INSTRUÇÕES DE INSTALAÇÃO ---
 * 1. Abra o seu Google Drive (drive.google.com).
 * 2. Crie uma nova Planilha Google (Sheets) e dê o nome de "Mudança Fácil - Orçamentos".
 * 3. Na planilha, clique no menu superior em: Extensões -> Apps Script.
 * 4. Apague todo o código existente lá e cole este código completo.
 * 5. Crie uma pasta no seu Google Drive chamada "Mudança Fácil - Sistema".
 *    - Abra essa pasta e copie o ID dela na barra de endereços (o ID é o código longo após "/folders/").
 *    - Substitua o ID na variável 'PARENT_FOLDER_ID' abaixo (linha 31) ou deixe vazio para o script criar tudo sozinho!
 * 6. No Apps Script, clique no botão azul "Implantar" (Deploy) no topo direito -> "Nova implantação" (New deployment).
 *    - Clique na engrenagem ao lado de "Selecione o tipo" e escolha "App da Web" (Web App).
 *    - Descrição: Mudança Fácil API
 *    - Executar como: "Eu" (Sua conta Google / Me)
 *    - Quem tem acesso: "Qualquer pessoa" (Anyone) -> ESSENCIAL para o site conseguir se conectar!
 *    - Clique em "Implantar".
 * 7. O Google solicitará autorização para acessar seus arquivos (Planilhas e Drive). Clique em "Autorizar acesso",
 *    depois em "Avançado" -> "Ir para ... (não seguro)" e confirme as permissões.
 * 8. Copie a "URL do app da Web" gerada. Ela se parece com:
 *    https://script.google.com/macros/s/AKfycb.../exec
 * 9. Cole essa URL no seu arquivo .env como 'VITE_APPS_SCRIPT_URL' ou diretamente no painel de configurações
 *    do simulador no seu site!
 */

// ID da pasta do Google Drive onde tudo será organizado. Se deixar vazio, criará na raiz do seu Drive.
var PARENT_FOLDER_ID = ""; 

function doPost(e) {
  // Configura cabeçalho CORS para responder requisições simples sem erros de segurança
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };

  try {
    // Processa os dados recebidos via POST
    var postData = JSON.parse(e.postData.contents);
    var proposal = postData.proposal;
    var totalVolume = postData.totalVolume || 0;
    var totalItems = postData.totalItems || 0;
    
    var client = proposal.client;
    var origin = proposal.origin;
    var destination = proposal.destination;
    
    // 1. Localizar ou Criar a Estrutura de Pastas no Google Drive
    var parentFolder;
    if (PARENT_FOLDER_ID) {
      parentFolder = DriveApp.getFolderById(PARENT_FOLDER_ID);
    } else {
      parentFolder = getOrCreateFolder("Mudança Fácil - Sistema", DriveApp.getRootFolder());
    }
    
    var pdfFolder = getOrCreateFolder("PDFs Orçamentos", parentFolder);
    var photosParentFolder = getOrCreateFolder("Fotos de Cargas", parentFolder);
    
    // Pasta específica para as fotos deste cliente
    var clientPhotosFolderName = "Fotos - " + client.name + " (" + proposal.id + ")";
    var clientPhotosFolder = getOrCreateFolder(clientPhotosFolderName, photosParentFolder);
    
    // 2. Processar e Salvar todas as fotos no Google Drive
    var photoUrls = [];
    var itemsList = proposal.items;
    
    for (var i = 0; i < itemsList.length; i++) {
      var item = itemsList[i];
      if (item.photos && item.photos.length > 0) {
        for (var p = 0; p < item.photos.length; p++) {
          try {
            var base64Data = item.photos[p];
            // Remove o prefixo data:image/jpeg;base64,
            var base64Clean = base64Data.split(",")[1] || base64Data;
            var decodedBlob = Utilities.newBlob(Utilities.base64Decode(base64Clean), "image/jpeg");
            
            var fileName = item.name.replace(/[^a-zA-Z0-0]/g, "_") + "_foto_" + (p + 1) + "_" + proposal.id + ".jpg";
            decodedBlob.setName(fileName);
            
            var photoFile = clientPhotosFolder.createFile(decodedBlob);
            photoFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
            photoUrls.push({
              itemName: item.name,
              url: photoFile.getUrl()
            });
          } catch (imgErr) {
            Logger.log("Erro ao salvar imagem do item: " + item.name + " - " + imgErr.toString());
          }
        }
      }
    }
    
    // 3. Montar a Planilha Google (Sheets)
    // Se o script foi iniciado a partir da planilha, usamos SpreadsheetApp.getActiveSpreadsheet().
    // Caso contrário, criamos uma ou buscamos pelo nome.
    var sheet;
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      sheet = ss.getSheetByName("Orçamentos") || ss.insertSheet("Orçamentos");
    } catch (sheetErr) {
      // Caso executado fora de uma planilha ativa, procura por uma planilha com o nome correspondente
      var files = DriveApp.getFilesByName("Mudança Fácil - Orçamentos");
      var ss;
      if (files.hasNext()) {
        ss = SpreadsheetApp.open(files.next());
      } else {
        ss = SpreadsheetApp.create("Mudança Fácil - Orçamentos");
        // Move para a pasta do sistema
        var file = DriveApp.getFileById(ss.getId());
        parentFolder.addFile(file);
        DriveApp.getRootFolder().removeFile(file);
      }
      sheet = ss.getSheetByName("Orçamentos") || ss.insertSheet("Orçamentos");
    }
    
    // Inicializar cabeçalho se a planilha estiver vazia
    if (sheet.getLastRow() === 0) {
      var headersRow = [
        "Data/Hora Registro", "ID Orçamento", "Nome Cliente", "WhatsApp", "E-mail", 
        "Data Mudança", "Tipo Residência", "Endereço Origem", "Andar Origem", "Elevador Origem (Retirada)", 
        "Endereço Destino", "Andar Destino", "Elevador Destino (Entrega)", "Distância (km)", 
        "Volume Carga (m³)", "Qtd Itens", "Valor Estimado (R$)", "Serviços Contratados", 
        "Materiais Requisitados", "Observações", "Link do PDF"
      ];
      sheet.appendRow(headersRow);
      sheet.getRange(1, 1, 1, headersRow.length).setFontWeight("bold").setBackground("#f1f5f9").setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
    
    // Formatar Serviços e Materiais para salvar como texto amigável
    var activeServices = proposal.services
      .filter(function(s) { return s.selected; })
      .map(function(s) { return s.name; })
      .join(", ");
      
    var activeMaterials = proposal.materials
      .filter(function(m) { return m.quantity > 0; })
      .map(function(m) { return m.name + " (" + m.quantity + "x)"; })
      .join(", ");
      
    var formattedMoveDate = "";
    if (client.moveDate) {
      var d = new Date(client.moveDate);
      // Ajusta timezone do fuso local
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
      formattedMoveDate = Utilities.formatDate(d, "GMT-3", "dd/MM/yyyy");
    }

    var timestamp = Utilities.formatDate(new Date(), "GMT-3", "dd/MM/yyyy HH:mm:ss");
    
    // 4. Gerar Documento HTML Profissional e Transformar em PDF
    var htmlContent = buildProfessionalHtml(proposal, totalVolume, totalItems);
    
    var htmlBlob = Utilities.newBlob(htmlContent, "text/html", "proposta_" + proposal.id + ".html");
    var tempFile = DriveApp.createFile(htmlBlob);
    
    // Converte o arquivo HTML para PDF no Google Drive
    var pdfBlob = tempFile.getAs("application/pdf");
    var pdfFileName = "Orçamento_Mudança_" + client.name.replace(/[^a-zA-Z0-0]/g, "_") + "_" + proposal.id + ".pdf";
    pdfBlob.setName(pdfFileName);
    
    var pdfFile = pdfFolder.createFile(pdfBlob);
    
    // Limpa o arquivo HTML temporário do Drive
    tempFile.setTrashed(true);
    
    // Torna o PDF público para qualquer pessoa com o link visualizar
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var pdfLink = pdfFile.getUrl();
    
    // 5. Salvar linha na planilha com os dados consolidados
    var rowData = [
      timestamp,
      proposal.id.toUpperCase(),
      client.name,
      "'" + client.whatsapp, // Previne que o Sheets remova o zero ou formate como número
      client.email || "Não informado",
      formattedMoveDate,
      client.residenceType.toUpperCase(),
      origin.address + ", " + origin.city + " - " + origin.state,
      origin.floor || "Térreo",
      origin.hasElevator ? "Sim" : "Não (Escadas)",
      destination.address + ", " + destination.city + " - " + destination.state,
      destination.floor || "Térreo",
      destination.hasElevator ? "Sim" : "Não (Escadas)",
      proposal.distanceKm ? parseFloat(proposal.distanceKm) : 0,
      parseFloat(totalVolume.toFixed(2)),
      totalItems,
      "", // Valor Estimado removido conforme solicitação do usuário
      activeServices || "Nenhum",
      activeMaterials || "Nenhum",
      client.observations || "Nenhuma",
      pdfLink
    ];
    
    sheet.appendRow(rowData);
    
    // Retorna resposta JSON de sucesso para o site
    var response = {
      success: true,
      quoteId: proposal.id,
      pdfLink: pdfLink
    };
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    // Retorna erro estruturado caso algo dê errado no processo
    var errorResponse = {
      success: false,
      error: err.toString()
    };
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Função utilitária para localizar ou criar pastas de forma recursiva
 */
function getOrCreateFolder(folderName, parentFolder) {
  var folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    var newFolder = parentFolder.createFolder(folderName);
    return newFolder;
  }
}

/**
 * Constrói o layout HTML profissional do orçamento com inline CSS elegante
 */
function buildProfessionalHtml(proposal, totalVolume, totalItems) {
  var client = proposal.client;
  var origin = proposal.origin;
  var destination = proposal.destination;
  var dateStr = Utilities.formatDate(new Date(), "GMT-3", "dd/MM/yyyy");
  
  var moveDateFormatted = "";
  if (client.moveDate) {
    var d = new Date(client.moveDate);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    moveDateFormatted = Utilities.formatDate(d, "GMT-3", "dd/MM/yyyy");
  }

  // Tabela de itens do inventário
  var itemsRowsHtml = "";
  for (var i = 0; i < proposal.items.length; i++) {
    var item = proposal.items[i];
    itemsRowsHtml += "<tr>" +
      "<td style='padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px;'>" + item.name + "</td>" +
      "<td style='padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; text-align: center;'>" + item.room + "</td>" +
      "<td style='padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; text-align: center; font-weight: bold;'>" + item.quantity + "</td>" +
      "<td style='padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; text-align: center; font-family: monospace;'>" + (item.volume * item.quantity).toFixed(2) + " m³</td>" +
      "<td style='padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 10px; color: #64748b;'>" + (item.observation || "-") + "</td>" +
      "</tr>";
  }

  // Materiais requisitados
  var materialsHtml = "";
  var hasMaterials = false;
  for (var m = 0; m < proposal.materials.length; m++) {
    var mat = proposal.materials[m];
    if (mat.quantity > 0) {
      hasMaterials = true;
      materialsHtml += "<div style='display: inline-block; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 6px; margin: 4px; font-size: 11px;'>" +
        "📦 <strong>" + mat.name + "</strong>: " + mat.quantity + " un" +
        "</div>";
    }
  }
  if (!hasMaterials) {
    materialsHtml = "<p style='font-size: 11px; color: #94a3b8; font-style: italic; margin: 0;'>Nenhum material de embalagem solicitado.</p>";
  }

  // Serviços contratados
  var servicesHtml = "";
  var hasServices = false;
  for (var s = 0; s < proposal.services.length; s++) {
    var ser = proposal.services[s];
    if (ser.selected) {
      hasServices = true;
      servicesHtml += "<div style='display: inline-block; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 6px 12px; border-radius: 6px; margin: 4px; font-size: 11px; font-weight: 600;'>" +
        "🛠️ " + ser.name +
        "</div>";
    }
  }
  if (!hasServices) {
    servicesHtml = "<p style='font-size: 11px; color: #94a3b8; font-style: italic; margin: 0;'>Nenhum serviço adicional especializado selecionado.</p>";
  }

  // Seção de Fotos anexadas (Miniaturas base64)
  var photosHtml = "";
  var photoCount = 0;
  for (var k = 0; k < proposal.items.length; k++) {
    var item = proposal.items[k];
    if (item.photos && item.photos.length > 0) {
      for (var p = 0; p < item.photos.length; p++) {
        photoCount++;
        photosHtml += "<div style='display: inline-block; border: 1px solid #e2e8f0; border-radius: 8px; padding: 4px; margin: 6px; background: #fff; text-align: center;'>" +
          "<img src='" + item.photos[p] + "' style='width: 110px; height: 110px; object-fit: cover; border-radius: 6px; display: block;' />" +
          "<span style='font-size: 9px; color: #64748b; font-weight: bold; margin-top: 4px; display: block; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;'>" + item.name + "</span>" +
          "</div>";
      }
    }
  }
  
  var photosSection = "";
  if (photoCount > 0) {
    photosSection = "<div style='margin-top: 25px; page-break-inside: avoid;'>" +
      "<h3 style='font-size: 13px; color: #1e293b; border-bottom: 2px solid #ef4444; padding-bottom: 4px; margin-bottom: 10px; text-transform: uppercase; font-weight: bold;'>📷 Galeria de Fotos da Carga Anexadas</h3>" +
      "<div style='background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 12px;'>" +
      photosHtml +
      "</div>" +
      "</div>";
  }

  // Retorna o layout HTML completo com fontes modernas do Google Fonts
  return "<!DOCTYPE html>" +
    "<html>" +
    "<head>" +
    "<meta charset='utf-8'>" +
    "<title>Orçamento de Mudança #" + proposal.id.toUpperCase() + "</title>" +
    "</head>" +
    "<body style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #334155; margin: 0; padding: 20px; line-height: 1.5; background-color: #ffffff;\">" +
    
    // Cabeçalho da Proposta
    "<table style='width: 100%; border-collapse: collapse; margin-bottom: 25px;'>" +
    "<tr>" +
    "<td>" +
    "<div style='font-size: 24px; font-weight: 900; color: #ef4444; letter-spacing: -0.5px;'>🚚 MUDANÇA FÁCIL</div>" +
    "<div style='font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;'>O seu simulador de fretes e transportes</div>" +
    "</td>" +
    "<td style='text-align: right;'>" +
    "<div style='font-size: 14px; font-weight: bold; color: #1e293b;'>ORÇAMENTO DE MUDANÇA</div>" +
    "<div style='font-family: monospace; font-size: 12px; color: #64748b; font-weight: bold; margin-top: 2px;'>Nº #" + proposal.id.toUpperCase() + "</div>" +
    "<div style='font-size: 11px; color: #94a3b8; margin-top: 2px;'>Emissão: " + dateStr + "</div>" +
    "</td>" +
    "</tr>" +
    "</table>" +
    
    // Dados Principais do Cliente
    "<div style='background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; margin-bottom: 20px;'>" +
    "<h3 style='font-size: 12px; color: #64748b; margin-top: 0; margin-bottom: 10px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px; border-b: 1px solid #e2e8f0; padding-bottom: 4px;'>👤 Dados de Contato do Cliente</h3>" +
    "<table style='width: 100%; font-size: 12px; border-collapse: collapse;'>" +
    "<tr>" +
    "<td style='padding: 4px 0;'><strong>Nome Completo:</strong> " + client.name + "</td>" +
    "<td style='padding: 4px 0;'><strong>WhatsApp:</strong> " + client.whatsapp + "</td>" +
    "</tr>" +
    "<tr>" +
    "<td style='padding: 4px 0;'><strong>E-mail:</strong> " + (client.email || "Não informado") + "</td>" +
    "<td style='padding: 4px 0;'><strong>Data Pretendida:</strong> " + moveDateFormatted + "</td>" +
    "</tr>" +
    "<tr>" +
    "<td style='padding: 4px 0;'><strong>Tipo de Imóvel:</strong> " + client.residenceType.toUpperCase() + "</td>" +
    "<td style='padding: 4px 0;'><strong>Total de Itens:</strong> " + totalItems + " volumes (" + totalVolume.toFixed(2) + " m³)</td>" +
    "</tr>" +
    "</table>" +
    "</div>" +
    
    // Endereços de Origem e Destino
    "<table style='width: 100%; border-collapse: collapse; margin-bottom: 20px; table-layout: fixed;'>" +
    "<tr>" +
    "<td style='width: 48%; vertical-align: top; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 12px;'>" +
    "<h4 style='font-size: 11px; color: #166534; margin: 0 0 8px 0; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;'>📍 Endereço de Origem (Retirada)</h4>" +
    "<p style='font-size: 11px; margin: 0 0 6px 0;'><strong>Rua:</strong> " + origin.address + "</p>" +
    "<p style='font-size: 11px; margin: 0 0 6px 0;'><strong>Cidade/UF:</strong> " + origin.city + " - " + origin.state + "</p>" +
    "<p style='font-size: 11px; margin: 0 0 6px 0;'><strong>CEP:</strong> " + (origin.cep || "-") + "</p>" +
    "<p style='font-size: 11px; margin: 0;'><strong>Andar:</strong> " + (origin.floor || "Térreo") + " | <strong>Elevador:</strong> " + (origin.hasElevator ? "Sim ✅" : "Não (Escadas) ❌") + "</p>" +
    "</td>" +
    "<td style='width: 4%;'></td>" + // espaçador
    "<td style='width: 48%; vertical-align: top; background: #fff7ed; border: 1px solid #ffedd5; border-radius: 12px; padding: 12px;'>" +
    "<h4 style='font-size: 11px; color: #9a3412; margin: 0 0 8px 0; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;'>🏁 Endereço de Destino (Entrega)</h4>" +
    "<p style='font-size: 11px; margin: 0 0 6px 0;'><strong>Rua:</strong> " + destination.address + "</p>" +
    "<p style='font-size: 11px; margin: 0 0 6px 0;'><strong>Cidade/UF:</strong> " + destination.city + " - " + destination.state + "</p>" +
    "<p style='font-size: 11px; margin: 0 0 6px 0;'><strong>CEP:</strong> " + (destination.cep || "-") + "</p>" +
    "<p style='font-size: 11px; margin: 0;'><strong>Andar:</strong> " + (destination.floor || "Térreo") + " | <strong>Elevador:</strong> " + (destination.hasElevator ? "Sim ✅" : "Não (Escadas) ❌") + "</p>" +
    "</td>" +
    "</tr>" +
    "</table>" +

    // Informações da Rota
    (proposal.distanceKm ? 
    "<div style='background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; margin-bottom: 20px; font-size: 11px;'>" +
    "🛣️ <strong>Logística da Rota:</strong> Distância aproximada de <strong>" + proposal.distanceKm + " km</strong> " +
    (proposal.durationMin ? "com tempo estimado de trânsito de <strong>~" + proposal.durationMin + " minutos</strong>." : "") +
    "</div>" : "") +

    // Tabela detalhada de Itens
    "<h3 style='font-size: 13px; color: #1e293b; border-bottom: 2px solid #ef4444; padding-bottom: 4px; margin-bottom: 10px; text-transform: uppercase; font-weight: bold;'>📋 Inventário Detalhado da Carga</h3>" +
    "<table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>" +
    "<thead>" +
    "<tr style='background: #f1f5f9;'>" +
    "<th style='padding: 8px 10px; text-align: left; font-size: 11px; font-weight: bold; border-bottom: 2px solid #cbd5e1;'>Item / Descrição</th>" +
    "<th style='padding: 8px 10px; text-align: center; font-size: 11px; font-weight: bold; border-bottom: 2px solid #cbd5e1;'>Cômodo</th>" +
    "<th style='padding: 8px 10px; text-align: center; font-size: 11px; font-weight: bold; border-bottom: 2px solid #cbd5e1;'>Qtd</th>" +
    "<th style='padding: 8px 10px; text-align: center; font-size: 11px; font-weight: bold; border-bottom: 2px solid #cbd5e1;'>Volume Total</th>" +
    "<th style='padding: 8px 10px; text-align: left; font-size: 11px; font-weight: bold; border-bottom: 2px solid #cbd5e1;'>Observação</th>" +
    "</tr>" +
    "</thead>" +
    "<tbody>" +
    itemsRowsHtml +
    "</tbody>" +
    "</table>" +

    // Materiais e Serviços Adicionais
    "<table style='width: 100%; border-collapse: collapse; margin-bottom: 20px; table-layout: fixed;'>" +
    "<tr>" +
    "<td style='width: 48%; vertical-align: top;'>" +
    "<h4 style='font-size: 12px; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 0; margin-bottom: 8px; text-transform: uppercase; font-weight: bold;'>📦 Materiais Solicitados</h4>" +
    materialsHtml +
    "</td>" +
    "<td style='width: 4%;'></td>" +
    "<td style='width: 48%; vertical-align: top;'>" +
    "<h4 style='font-size: 12px; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 0; margin-bottom: 8px; text-transform: uppercase; font-weight: bold;'>🛠️ Serviços Extras</h4>" +
    servicesHtml +
    "</td>" +
    "</tr>" +
    "</table>" +

    // Observações Gerais
    (client.observations ?
    "<div style='margin-bottom: 20px;'>" +
    "<h4 style='font-size: 12px; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 0; margin-bottom: 8px; text-transform: uppercase; font-weight: bold;'>💬 Observações Importantes</h4>" +
    "<p style='font-size: 11px; background: #fff; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; margin: 0; font-style: italic; color: #475569;'>" + client.observations + "</p>" +
    "</div>" : "") +

    // Resumo Geral do Inventário (Sem valor estimado)
    "<div style='border: 2px solid #1e293b; border-radius: 16px; padding: 18px; background: #f8fafc; margin-bottom: 25px; page-break-inside: avoid;'>" +
    "<table style='width: 100%; border-collapse: collapse;'>" +
    "<tr>" +
    "<td>" +
    "<div style='font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;'>SOLICITAÇÃO DE ORÇAMENTO</div>" +
    "<div style='font-size: 15px; font-weight: 900; color: #1e293b; margin-top: 2px;'>Resumo Geral da Carga</div>" +
    "<p style='font-size: 10px; color: #64748b; margin: 4px 0 0 0;'>Inventário detalhado para elaboração de proposta comercial personalizada.</p>" +
    "</td>" +
    "<td style='text-align: right; vertical-align: middle;'>" +
    "<div style='font-size: 10px; color: #64748b; font-weight: bold;'>VOLUME TOTAL</div>" +
    "<div style='font-size: 24px; font-weight: 900; color: #1e293b; font-family: monospace;'>" + totalVolume.toFixed(2) + " m³</div>" +
    "</td>" +
    "</tr>" +
    "</table>" +
    "</div>" +

    // Galeria de fotos incorporada
    photosSection +

    // Rodapé de segurança do documento
    "<div style='margin-top: 40px; text-align: center; border-t: 1px solid #e2e8f0; padding-top: 15px; font-size: 10px; color: #94a3b8; page-break-inside: avoid;'>" +
    "<p style='margin: 0;'>Este documento é uma estimativa orçamentária baseada nas informações voluntárias providas pelo simulador.</p>" +
    "<p style='margin: 4px 0 0 0;'><strong>Mudança Fácil © 2026</strong> - Todos os direitos reservados. Gerado via Google Workspace Integration.</p>" +
    "</div>" +

    "</body>" +
    "</html>";
}
