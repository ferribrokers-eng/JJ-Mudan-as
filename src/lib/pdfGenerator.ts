import { jsPDF } from 'jspdf';
import { MoveProposal } from '../types';

export interface CompanyPdfBranding {
  companyName?: string;
  whatsapp?: string;
  logoUrl?: string;
  primaryColor?: string;
}

export function generateMovePDF(proposal: MoveProposal, companyInfo?: CompanyPdfBranding): Blob {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const companyTitle = (companyInfo?.companyName || 'JJ MUDANÇAS').toUpperCase();
  const companyPhone = companyInfo?.whatsapp ? companyInfo.whatsapp : '(11) 95980-3341';

  // Helper to parse hex color to rgb
  const hexToRgb = (hex?: string) => {
    if (!hex || !hex.startsWith('#')) return [18, 53, 91];
    const clean = hex.replace('#', '');
    if (clean.length === 6) {
      return [
        parseInt(clean.substring(0, 2), 16),
        parseInt(clean.substring(2, 4), 16),
        parseInt(clean.substring(4, 6), 16)
      ];
    }
    return [18, 53, 91];
  };

  const primaryColor = hexToRgb(companyInfo?.primaryColor); // Deep Blue or Custom Company Color
  const accentColor = [224, 86, 36]; // Orange Accent
  const darkTextColor = [44, 62, 80]; // Charcoal
  const lightTextColor = [127, 140, 141]; // Gray
  const lightBgColor = [245, 247, 250]; // Soft Gray

  const setPrimaryFill = () => doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  const setAccentFill = () => doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  const setLightFill = () => doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
  const setDarkText = () => doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  const setLightText = () => doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  const setPrimaryText = () => doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  const setAccentText = () => doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);

  let y = 15;
  const leftMargin = 15;
  const rightMargin = 195;
  const pageHeight = 297;

  // Helper to draw horizontal divider
  function drawDivider(yPos: number) {
    doc.setDrawColor(230, 233, 238);
    doc.setLineWidth(0.3);
    doc.line(leftMargin, yPos, rightMargin, yPos);
  }

  // Helper to ensure new pages
  function checkPageBreak(heightNeeded: number) {
    if (y + heightNeeded > pageHeight - 15) {
      doc.addPage();
      y = 15;
      drawHeaderFooter();
    }
  }

  // Draw Header and Footer on every page
  function drawHeaderFooter() {
    // Header background
    setLightFill();
    doc.rect(10, 10, 190, 20, 'F');
    
    // Logo text
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    setPrimaryText();
    doc.text(companyTitle, leftMargin, 21);

    // Header contact
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    setDarkText();
    doc.text('Inventário e Orçamento de Mudanças', leftMargin, 26);
    
    doc.text(`WhatsApp: ${companyPhone}`, rightMargin - 5, 20, { align: 'right' });

    // Footer
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    setLightText();
    doc.text(`${companyTitle} - Todos os direitos reservados`, leftMargin, pageHeight - 10);
    doc.text(`Página ${doc.getNumberOfPages()}`, rightMargin, pageHeight - 10, { align: 'right' });
  }


  // Initialize first page
  drawHeaderFooter();
  y = 36;

  // Title block
  setAccentFill();
  doc.rect(leftMargin, y, rightMargin - leftMargin, 8, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`PROPOSTA DE MUDANÇA E INVENTÁRIO - N. ${proposal.id.slice(0, 8).toUpperCase()}`, leftMargin + 3, y + 5.5);
  y += 13;

  // Client Info Section
  checkPageBreak(35);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  setPrimaryText();
  doc.text('1. DADOS DO CLIENTE', leftMargin, y);
  y += 3;
  drawDivider(y);
  y += 4;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  setDarkText();

  // Draw Client Info Card
  doc.setFont('Helvetica', 'bold'); doc.text('Nome:', leftMargin, y); doc.setFont('Helvetica', 'normal'); doc.text(proposal.client.name, leftMargin + 25, y);
  doc.setFont('Helvetica', 'bold'); doc.text('Contato:', leftMargin + 100, y); doc.setFont('Helvetica', 'normal'); doc.text(proposal.client.whatsapp, leftMargin + 125, y);
  y += 5;

  doc.setFont('Helvetica', 'bold'); doc.text('E-mail:', leftMargin, y); doc.setFont('Helvetica', 'normal'); doc.text(proposal.client.email || 'Não informado', leftMargin + 25, y);
  doc.setFont('Helvetica', 'bold'); doc.text('Data Mudança:', leftMargin + 100, y); doc.setFont('Helvetica', 'normal'); doc.text(new Date(proposal.client.moveDate).toLocaleDateString('pt-BR'), leftMargin + 125, y);
  y += 5;

  const resMap: Record<string, string> = {
    casa: 'Casa / Sobrado',
    apartamento: 'Apartamento',
    sobrado: 'Sobrado',
    comercial: 'Escritório',
    loja: 'Loja / Ponto'
  };
  doc.setFont('Helvetica', 'bold'); doc.text('Tipo de Imóvel:', leftMargin, y); doc.setFont('Helvetica', 'normal'); doc.text(resMap[proposal.client.residenceType] || 'Residencial', leftMargin + 25, y);
  y += 10;

  // Route Info Section
  checkPageBreak(40);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  setPrimaryText();
  doc.text('2. LOCAIS DE ORIGEM E DESTINO', leftMargin, y);
  y += 3;
  drawDivider(y);
  y += 5;

  // Draw side-by-side origin and destination cards
  const cardWidth = 85;
  
  const formatFullAddress = (addr: any) => {
    let parts = [];
    if (addr.address) {
      const streetAndNum = addr.number ? `${addr.address}, ${addr.number}` : addr.address;
      parts.push(streetAndNum);
    }
    if (addr.neighborhood) parts.push(addr.neighborhood);
    if (addr.city) {
      if (addr.state) {
        parts.push(`${addr.city} - ${addr.state}`);
      } else {
        parts.push(addr.city);
      }
    } else if (addr.state) {
      parts.push(addr.state);
    }
    if (addr.cep) parts.push(`CEP: ${addr.cep}`);
    return parts.join(', ') || 'Não informado';
  };

  const getFloorText = (floorVal: string | undefined) => {
    if (!floorVal) return 'Térreo';
    const isNum = !isNaN(Number(floorVal));
    return isNum ? `${floorVal}º andar` : floorVal;
  };

  const residenceType = resMap[proposal.client.residenceType] || 'Residencial';

  // Origin Card
  setLightFill();
  doc.rect(leftMargin, y, cardWidth, 28, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  setPrimaryText();
  doc.text(`ORIGEM (${residenceType.toUpperCase()})`, leftMargin + 3, y + 4.5);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  setDarkText();
  const originText = doc.splitTextToSize(formatFullAddress(proposal.origin), cardWidth - 6);
  doc.text(originText, leftMargin + 3, y + 9);
  
  doc.setFont('Helvetica', 'bold');
  const originStairsText = proposal.origin.hasStairs ? `Escada: Sim (${proposal.origin.stairsFlights || 1} lances)` : 'Escada: Não';
  doc.text(`Elevador: ${proposal.origin.hasElevator ? 'Sim' : 'Não'}   |   Andar: ${getFloorText(proposal.origin.floor)}   |   ${originStairsText}`, leftMargin + 3, y + 18);
  const distMap: Record<string, string> = { near: 'Curto (<15m)', medium: 'Médio (15-30m)', far: 'Longo (>30m)' };
  doc.text(`Distância Estacionamento: ${distMap[proposal.origin.parkingDistance] || 'Padrão'}`, leftMargin + 3, y + 23);

  // Destination Card
  setLightFill();
  doc.rect(leftMargin + cardWidth + 5, y, cardWidth, 28, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  setPrimaryText();
  doc.text('DESTINO', leftMargin + cardWidth + 8, y + 4.5);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  setDarkText();
  const destText = doc.splitTextToSize(formatFullAddress(proposal.destination), cardWidth - 6);
  doc.text(destText, leftMargin + cardWidth + 8, y + 9);
  
  doc.setFont('Helvetica', 'bold');
  const destStairsText = proposal.destination.hasStairs ? `Escada: Sim (${proposal.destination.stairsFlights || 1} lances)` : 'Escada: Não';
  doc.text(`Elevador: ${proposal.destination.hasElevator ? 'Sim' : 'Não'}   |   Andar: ${getFloorText(proposal.destination.floor)}   |   ${destStairsText}`, leftMargin + cardWidth + 8, y + 18);
  doc.text(`Distância Estacionamento: ${distMap[proposal.destination.parkingDistance] || 'Padrão'}`, leftMargin + cardWidth + 8, y + 23);

  if (proposal.distanceKm) {
    y += 30;
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(leftMargin, y, cardWidth * 2 + 5, 8, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42); // slate-900 / navy
    doc.text(`ROTA ESTIMADA (OpenStreetMap): Distancia Estimada: ${proposal.distanceKm} km` + 
             (proposal.durationMin ? `   |   Tempo Estimado de Viagem: ~${proposal.durationMin} minutos` : ''), 
             leftMargin + 4, y + 5.5);
    y += 14;
  } else {
    y += 36;
  }

  // Detailed Inventory Section
  checkPageBreak(40);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  setPrimaryText();
  doc.text('3. DETALHAMENTO DE ITENS DO INVENTÁRIO', leftMargin, y);
  y += 3;
  drawDivider(y);
  y += 5;

  // Table Headers
  setPrimaryFill();
  doc.rect(leftMargin, y, rightMargin - leftMargin, 6, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Cômodo', leftMargin + 3, y + 4.2);
  doc.text('Descrição do Item', leftMargin + 45, y + 4.2);
  doc.text('Quantidade', leftMargin + 160, y + 4.2);
  y += 6;

  // Render items grouping by room
  let totalVolume = 0;
  let totalItemsCount = 0;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  setDarkText();

  // We should render item by item, drawing rows
  proposal.items.forEach((item, index) => {
    checkPageBreak(6);
    
    // Zebra rows
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(leftMargin, y, rightMargin - leftMargin, 5.5, 'F');
    }

    setDarkText();
    // Shorten room label if too long
    const roomLabel = item.room.length > 20 ? item.room.slice(0, 18) + '...' : item.room;
    doc.setFont('Helvetica', 'bold');
    doc.text(roomLabel, leftMargin + 3, y + 4);

    doc.setFont('Helvetica', 'normal');
    const itemName = item.observation ? `${item.name} (${item.observation})` : item.name;
    const truncatedName = itemName.length > 55 ? itemName.slice(0, 52) + '...' : itemName;
    doc.text(truncatedName, leftMargin + 45, y + 4);

    doc.setFont('Helvetica', 'bold');
    doc.text(item.quantity.toString(), leftMargin + 165, y + 4);

    const itemTotalVol = item.volume * item.quantity;
    totalVolume += itemTotalVol;
    totalItemsCount += item.quantity;
    y += 5.5;
  });

  // Material Details Section (if any selected)
  const selectedMaterials = proposal.materials.filter(m => m.quantity > 0);
  if (selectedMaterials.length > 0) {
    checkPageBreak(30);
    y += 4;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    setPrimaryText();
    doc.text('4. MATERIAIS DE EMBALAGEM REQUISITADOS', leftMargin, y);
    y += 3;
    drawDivider(y);
    y += 5;

    // Materials Headers
    setPrimaryFill();
    doc.rect(leftMargin, y, rightMargin - leftMargin, 6, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('Material / Insumo', leftMargin + 3, y + 4.2);
    doc.text('Descrição', leftMargin + 60, y + 4.2);
    doc.text('Quantidade', leftMargin + 155, y + 4.2);
    y += 6;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    selectedMaterials.forEach((material, index) => {
      checkPageBreak(6);
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(leftMargin, y, rightMargin - leftMargin, 5.5, 'F');
      }
      setDarkText();
      doc.setFont('Helvetica', 'bold');
      doc.text(material.name, leftMargin + 3, y + 4);
      doc.setFont('Helvetica', 'normal');
      doc.text(material.description, leftMargin + 60, y + 4);
      doc.setFont('Helvetica', 'bold');
      doc.text(`${material.quantity} ${material.unit}`, leftMargin + 155, y + 4);
      y += 5.5;
    });
  }

  // Extra Services Section
  const selectedServices = proposal.services.filter(s => s.selected);
  if (selectedServices.length > 0) {
    checkPageBreak(30);
    y += 4;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    setPrimaryText();
    doc.text('5. SERVIÇOS ADICIONAIS CONTRATADOS', leftMargin, y);
    y += 3;
    drawDivider(y);
    y += 5;

    // Services list
    selectedServices.forEach((service, index) => {
      checkPageBreak(8);
      setLightFill();
      doc.rect(leftMargin, y, rightMargin - leftMargin, 6.5, 'F');
      
      setDarkText();
      doc.setFont('Helvetica', 'bold');
      doc.text(`*  ${service.name}`, leftMargin + 3, y + 4.5);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.text(service.description, leftMargin + 65, y + 4.5);
      
      y += 7.5;
    });
  }

  // Summary and Estimate Calculations
  checkPageBreak(40);
  y += 4;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  setPrimaryText();
  doc.text('6. RESUMO E ESTIMATIVA', leftMargin, y);
  y += 3;
  drawDivider(y);
  y += 5;

  // Blue card for results
  setPrimaryFill();
  doc.rect(leftMargin, y, rightMargin - leftMargin, 22, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Total de Móveis / Itens:', leftMargin + 5, y + 6.5);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${totalItemsCount} unidades`, leftMargin + 48, y + 6.5);

  doc.setFont('Helvetica', 'bold');
  doc.text('Valor do Serviço:', leftMargin + 5, y + 14);
  doc.setFont('Helvetica', 'normal');
  doc.text('A combinar / Sob Consulta', leftMargin + 48, y + 14);

  // Suggested Truck Type
  let truckType = 'Fiorino / Van de Carga';
  let truckDesc = 'Ideal para pequenas mudanças, caixas e malas.';
  if (totalVolume > 35) {
    truckType = 'Caminhão Baú Truck / Carreta';
    truckDesc = 'Necessário para grandes mudanças residenciais de alto volume.';
  } else if (totalVolume > 18) {
    truckType = 'Caminhão Baú Toco / Grande';
    truckDesc = 'Indicado para mudanças de casas de 3+ quartos ou apartamentos grandes.';
  } else if (totalVolume > 8) {
    truckType = 'Caminhão Baú 3/4 (Médio)';
    truckDesc = 'Perfeito para apartamentos de 1 a 2 dormitórios com mobília padrão.';
  } else if (totalVolume > 3) {
    truckType = 'HR / Iveco Daily (Mini-Caminhão)';
    truckDesc = 'Excelente para mudanças compactas, kitnets ou escritórios pequenos.';
  }

  doc.setFont('Helvetica', 'bold');
  doc.text('Caminhão Recomendado:', leftMargin + 105, y + 6.5);
  doc.setFont('Helvetica', 'normal');
  doc.text(truckType, leftMargin + 145, y + 6.5);
  doc.setFontSize(7);
  doc.text(truckDesc, leftMargin + 105, y + 12);

  y += 28;

  // Comments / Observations if any
  if (proposal.client.observations) {
    checkPageBreak(25);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    setDarkText();
    doc.text('Observações do Cliente:', leftMargin, y);
    y += 4;
    
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(7.5);
    const obsText = doc.splitTextToSize(proposal.client.observations, rightMargin - leftMargin);
    doc.text(obsText, leftMargin, y);
    y += obsText.length * 3.5 + 4;
  }

  // Terms and Signature block
  checkPageBreak(35);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  setLightText();
  const termsText = 'Notas importantes:\n' +
    '1. Este inventário reflete os itens declarados para fins de estimativa de frete.\n' +
    '2. Móveis adicionais não listados no momento do carregamento estarão sujeitos à taxa de frete adicional ou renegociação de valores.\n' +
    '3. O cliente declara que as informações de andares, elevadores e distâncias são verídicas, sob risco de acréscimo de taxa operacional no local.';
  doc.text(termsText, leftMargin, y);
  
  y += 18;
  
  // Signatures lines
  checkPageBreak(25);
  doc.setDrawColor(189, 195, 199);
  doc.setLineWidth(0.3);
  doc.line(leftMargin + 5, y, leftMargin + 75, y);
  doc.line(leftMargin + 105, y, leftMargin + 175, y);
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  setDarkText();
  doc.text('Assinatura do Cliente', leftMargin + 20, y + 4);
  doc.text('Mudança Fácil & Transportes', leftMargin + 112, y + 4);
  doc.setFont('Helvetica', 'normal');
  doc.text(proposal.client.name, leftMargin + 15, y + 8, { maxWidth: 60 });
  doc.text('Representante Comercial', leftMargin + 123, y + 8);

  return doc.output('blob');
}
