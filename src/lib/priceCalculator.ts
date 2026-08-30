import { MoveProposal } from '../types';

/**
 * Calculates a professional estimate budget for the moving proposal.
 * Completely free, based on base fares, cargo volume (cubagem), route distance, and additional parameters.
 */
export function calculateMovePrice(proposal: {
  items: { volume: number; quantity: number }[];
  materials: { id: string; quantity: number }[];
  services: { id: string; selected: boolean }[];
  distanceKm?: string;
  origin: { hasElevator: boolean; floor: string };
  destination: { hasElevator: boolean; floor: string };
}) {
  const totalVolume = proposal.items.reduce((acc, curr) => acc + (curr.volume * curr.quantity), 0);
  const dist = parseFloat(proposal.distanceKm || '0') || 0;
  
  const basePrice = 350; // Base rate for driver and truck
  const volumePrice = totalVolume * 55; // R$ 55.00 per m³
  const distancePrice = dist * 4.8; // R$ 4.80 per km
  
  // Escadaria fee (if no elevator and floor is 2nd or above)
  let originFloorFee = 0;
  if (!proposal.origin.hasElevator && proposal.origin.floor) {
    const floorNum = parseInt(proposal.origin.floor.replace(/\D/g, '')) || 0;
    if (floorNum > 1) originFloorFee = (floorNum - 1) * 45; // R$ 45 per floor above ground
  }
  
  let destFloorFee = 0;
  if (!proposal.destination.hasElevator && proposal.destination.floor) {
    const floorNum = parseInt(proposal.destination.floor.replace(/\D/g, '')) || 0;
    if (floorNum > 1) destFloorFee = (floorNum - 1) * 45; // R$ 45 per floor above ground
  }
  
  // Materials selected cost
  const materialsPrice = proposal.materials.reduce((sum, m) => {
    let itemPrice = 0;
    if (m.id === 'caixa_p') itemPrice = 8;
    else if (m.id === 'caixa_m') itemPrice = 12;
    else if (m.id === 'caixa_g') itemPrice = 16;
    else if (m.id === 'plastico_bolha') itemPrice = 65;
    else if (m.id === 'cabideiro_papelao') itemPrice = 35;
    else if (m.id === 'fita_adesiva') itemPrice = 10;
    else if (m.id === 'papel_acoplado') itemPrice = 25;
    else if (m.id === 'filme_stretch') itemPrice = 35;
    return sum + (m.quantity * itemPrice);
  }, 0);
  
  // Services selected cost
  const servicesPrice = proposal.services.reduce((sum, s) => {
    if (!s.selected) return sum;
    let servicePrice = 0;
    if (s.id === 'desmontagem') servicePrice = 150;
    else if (s.id === 'montagem') servicePrice = 150;
    else if (s.id === 'embalamento_profissional') servicePrice = 200;
    else if (s.id === 'ajudantes_extras') servicePrice = 180;
    return sum + servicePrice;
  }, 0);
  
  const total = basePrice + volumePrice + distancePrice + originFloorFee + destFloorFee + materialsPrice + servicesPrice;
  
  return {
    basePrice,
    volumePrice,
    distancePrice,
    floorFees: originFloorFee + destFloorFee,
    materialsPrice,
    servicesPrice,
    total: Math.max(Math.round(total), 350) // Minimum charge is R$ 350
  };
}
