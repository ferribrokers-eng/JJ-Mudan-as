import { RoomPreset, MaterialItem, ServiceItem } from '../types';

// Presets para Residencial (Casa / Sobrado / Apartamento)
export const RESIDENTIAL_ROOM_PRESETS: RoomPreset[] = [
  {
    id: 'cozinha',
    name: 'Cozinha',
    icon: 'Utensils',
    items: [
      { name: 'Geladeira Duplex / French Door', volume: 1.4, category: 'cozinha' },
      { name: 'Geladeira Simples', volume: 0.8, category: 'cozinha' },
      { name: 'Fogão 5/6 Bocas / Cooktop', volume: 0.6, category: 'cozinha' },
      { name: 'Fogão 4 Bocas', volume: 0.4, category: 'cozinha' },
      { name: 'Micro-ondas', volume: 0.12, category: 'cozinha' },
      { name: 'Forno Elétrico / Embutir', volume: 0.15, category: 'cozinha' },
      { name: 'Máquina de Lavar Louças', volume: 0.5, category: 'cozinha' },
      { name: 'Armário de Cozinha (Módulo Aéreo)', volume: 0.5, category: 'cozinha' },
      { name: 'Armário de Cozinha (Balcão/Pia)', volume: 0.7, category: 'cozinha' },
      { name: 'Mesa de Cozinha com Cadeiras', volume: 0.8, category: 'cozinha' },
      { name: 'Banqueta / Cadeira Alta', volume: 0.1, category: 'cozinha' },
      { name: 'Freezer Vertical / Horizontal', volume: 1.1, category: 'cozinha' },
      { name: 'Purificador / Filtro de Água', volume: 0.1, category: 'cozinha' },
      { name: 'Air Fryer / Eletroportáteis', volume: 0.08, category: 'cozinha' }
    ]
  },
  {
    id: 'sala',
    name: 'Sala de Estar / Jantar',
    icon: 'Tv',
    items: [
      { name: 'Sofá Retrátil / 3 Lugares', volume: 1.8, category: 'sala' },
      { name: 'Sofá 2 Lugares', volume: 1.2, category: 'sala' },
      { name: 'Sofá de Canto / Chaise', volume: 2.2, category: 'sala' },
      { name: 'Poltrona / Puff Decorativo', volume: 0.5, category: 'sala' },
      { name: 'Rack com Painel de TV', volume: 0.8, category: 'sala' },
      { name: 'Smart TV (40" a 75")', volume: 0.2, category: 'sala' },
      { name: 'Aparador / Buffet de Jantar', volume: 0.8, category: 'sala' },
      { name: 'Mesa de Jantar (6 a 8 Cadeiras)', volume: 1.6, category: 'sala' },
      { name: 'Mesa de Jantar (4 Cadeiras)', volume: 1.0, category: 'sala' },
      { name: 'Cadeiras de Jantar Avulsas', volume: 0.15, category: 'sala' },
      { name: 'Cristaleira / Barzinho', volume: 1.2, category: 'sala' },
      { name: 'Estante / Biblioteca', volume: 0.9, category: 'sala' },
      { name: 'Mesa de Centro / Apoio Lateral', volume: 0.25, category: 'sala' },
      { name: 'Tapete Grande Enrolado', volume: 0.15, category: 'sala' }
    ]
  },
  {
    id: 'quarto_principal',
    name: 'Quarto Principal (Casal)',
    icon: 'BedDouble',
    items: [
      { name: 'Cama Queen / King Size (Box + Colchão)', volume: 1.8, category: 'quarto' },
      { name: 'Cama de Casal Padrão', volume: 1.3, category: 'quarto' },
      { name: 'Colchão de Casal Avulso', volume: 0.6, category: 'quarto' },
      { name: 'Guarda-Roupa Grande (6+ portas / Casal)', volume: 2.6, category: 'quarto' },
      { name: 'Guarda-Roupa Médio (3 ou 4 portas)', volume: 1.8, category: 'quarto' },
      { name: 'Cômoda Grande com Gavetas', volume: 0.7, category: 'quarto' },
      { name: 'Mesa de Cabeceira / Criado-Mudo', volume: 0.15, category: 'quarto' },
      { name: 'Penteadeira / Camarim com Espelho', volume: 0.8, category: 'quarto' },
      { name: 'Painel de TV do Quarto', volume: 0.25, category: 'quarto' },
      { name: 'Sapateira', volume: 0.4, category: 'quarto' },
      { name: 'Televisor Quarto', volume: 0.15, category: 'quarto' }
    ]
  },
  {
    id: 'quarto_secundario',
    name: 'Outros Quartos / Infantil',
    icon: 'Bed',
    items: [
      { name: 'Cama de Solteiro / Box', volume: 0.8, category: 'quarto' },
      { name: 'Beliche / Triliche / Bicama', volume: 1.5, category: 'quarto' },
      { name: 'Colchão de Solteiro', volume: 0.4, category: 'quarto' },
      { name: 'Guarda-Roupa Solteiro (2/3 portas)', volume: 1.3, category: 'quarto' },
      { name: 'Escrivaninha / Mesa de Estudo', volume: 0.6, category: 'quarto' },
      { name: 'Cadeira de Estudo', volume: 0.2, category: 'quarto' },
      { name: 'Cômoda Pequena', volume: 0.4, category: 'quarto' },
      { name: 'Berço / Cama Infantil', volume: 0.5, category: 'quarto' },
      { name: 'Prateleiras / Nichos', volume: 0.15, category: 'quarto' },
      { name: 'Baú / Caixa de Brinquedos', volume: 0.3, category: 'quarto' }
    ]
  },
  {
    id: 'servico',
    name: 'Área de Serviço / Lavanderia',
    icon: 'WashingMachine',
    items: [
      { name: 'Máquina de Lavar Roupa', volume: 0.6, category: 'servico' },
      { name: 'Lava e Seca', volume: 0.6, category: 'servico' },
      { name: 'Máquina de Secar Roupa', volume: 0.6, category: 'servico' },
      { name: 'Tanquinho de Lavar Roupa', volume: 0.4, category: 'servico' },
      { name: 'Armário Multiuso / Dispensa', volume: 0.7, category: 'servico' },
      { name: 'Tábua de Passar Roupa', volume: 0.1, category: 'servico' },
      { name: 'Varal de Teto ou Chão', volume: 0.1, category: 'servico' },
      { name: 'Aspirador de Pó', volume: 0.1, category: 'servico' },
      { name: 'Escada de Alumínio / Dobrável', volume: 0.15, category: 'servico' },
      { name: 'Cesto de Roupas', volume: 0.15, category: 'servico' }
    ]
  },
  {
    id: 'escritorio',
    name: 'Escritório / Home Office',
    icon: 'Briefcase',
    items: [
      { name: 'Escrivaninha / Mesa em L ou Grande', volume: 0.8, category: 'escritorio' },
      { name: 'Cadeira de Escritório Ergonômica / Gamer', volume: 0.35, category: 'escritorio' },
      { name: 'Estante para Livros / Pastas', volume: 0.8, category: 'escritorio' },
      { name: 'Gaveteiro Organizador', volume: 0.2, category: 'escritorio' },
      { name: 'Computador Completo (Monitor + CPU/Mac)', volume: 0.2, category: 'escritorio' },
      { name: 'Impressora / Multifuncional', volume: 0.12, category: 'escritorio' },
      { name: 'Sofá-Cama Escritório', volume: 1.1, category: 'escritorio' }
    ]
  },
  {
    id: 'externa_garagem',
    name: 'Área Externa / Garagem / Quintal',
    icon: 'Car',
    items: [
      { name: 'Bicicleta Adulto / Infantil', volume: 0.4, category: 'externa' },
      { name: 'Churrasqueira Portátil / Tambor', volume: 0.35, category: 'externa' },
      { name: 'Mesa de Jardim Plástica/Madeira', volume: 0.6, category: 'externa' },
      { name: 'Cadeira de Jardim / Espreguiçadeira', volume: 0.15, category: 'externa' },
      { name: 'Vaso de Planta Grande', volume: 0.25, category: 'externa' },
      { name: 'Vaso de Planta Médio/Pequeno', volume: 0.1, category: 'externa' },
      { name: 'Esteira Ergométrica', volume: 0.8, category: 'externa' },
      { name: 'Bicicleta Ergométrica', volume: 0.5, category: 'externa' },
      { name: 'Caixa de Ferramentas Grande', volume: 0.15, category: 'externa' },
      { name: 'Cortador de Grama', volume: 0.4, category: 'externa' }
    ]
  },
  {
    id: 'caixas_geral',
    name: 'Caixas e Embalados Gerais',
    icon: 'Package',
    items: [
      { name: 'Caixa de Papelão Pequena (Livros/Louça)', volume: 0.04, category: 'caixas' },
      { name: 'Caixa de Papelão Média (Geral/Roupas)', volume: 0.08, category: 'caixas' },
      { name: 'Caixa de Papelão Grande (Leves/Brinquedos)', volume: 0.15, category: 'caixas' },
      { name: 'Mala de Viagem Grande', volume: 0.15, category: 'caixas' },
      { name: 'Mala de Viagem Média/Pequena', volume: 0.08, category: 'caixas' },
      { name: 'Saco de Lixo Grande (Roupas/Macios)', volume: 0.1, category: 'caixas' },
      { name: 'Caixa Plástica Organizadora', volume: 0.08, category: 'caixas' }
    ]
  }
];

// Presets para Escritório / Empresa
export const OFFICE_ROOM_PRESETS: RoomPreset[] = [
  {
    id: 'estacoes_trabalho',
    name: 'Estações de Trabalho & Escritório',
    icon: 'Briefcase',
    items: [
      { name: 'Mesa de Trabalho / Baia Individual', volume: 0.6, category: 'escritorio' },
      { name: 'Mesa Plataforma (4 a 6 lugares)', volume: 1.8, category: 'escritorio' },
      { name: 'Cadeira Giratória Ergonômica', volume: 0.3, category: 'escritorio' },
      { name: 'Gaveteiro Volante / Fixo', volume: 0.15, category: 'escritorio' },
      { name: 'Computador Completo (Monitor + CPU)', volume: 0.15, category: 'escritorio' },
      { name: 'Monitor Adicional', volume: 0.08, category: 'escritorio' },
      { name: 'Impressora Corporativa / Scanner', volume: 0.3, category: 'escritorio' },
      { name: 'Armário Alto para Documentos', volume: 0.8, category: 'escritorio' },
      { name: 'Lixeira de Escritório / Fragmentadora', volume: 0.1, category: 'escritorio' }
    ]
  },
  {
    id: 'sala_reuniao',
    name: 'Sala de Reunião & Diretoria',
    icon: 'Tv',
    items: [
      { name: 'Mesa de Reunião Grande (8-12 pessoas)', volume: 2.0, category: 'escritorio' },
      { name: 'Mesa de Reunião Média (4-6 pessoas)', volume: 1.2, category: 'escritorio' },
      { name: 'Cadeira Executiva / Diretoria', volume: 0.35, category: 'escritorio' },
      { name: 'Smart TV para Apresentações / Vídeo', volume: 0.2, category: 'escritorio' },
      { name: 'Quadro Branco / Flipchart', volume: 0.2, category: 'escritorio' },
      { name: 'Aparador / Buffet Corporativo', volume: 0.7, category: 'escritorio' },
      { name: 'Frigobar / Cafeteira Corporativa', volume: 0.25, category: 'escritorio' }
    ]
  },
  {
    id: 'recepcao_espera',
    name: 'Recepção & Área de Espera',
    icon: 'Building2',
    items: [
      { name: 'Balcão de Recepção / Atendimento', volume: 1.2, category: 'escritorio' },
      { name: 'Sofá de Recepção (2/3 lugares)', volume: 1.4, category: 'escritorio' },
      { name: 'Poltronas de Espera', volume: 0.4, category: 'escritorio' },
      { name: 'Mesa de Centro / Revisteiro', volume: 0.2, category: 'escritorio' },
      { name: 'Bebedouro / Purificador de Coluna', volume: 0.2, category: 'escritorio' },
      { name: 'Porta-Guarda-Chuvas / Totem', volume: 0.1, category: 'escritorio' }
    ]
  },
  {
    id: 'copa_corporativa',
    name: 'Copa / Cozinha da Empresa',
    icon: 'Utensils',
    items: [
      { name: 'Geladeira Corporativa', volume: 1.2, category: 'cozinha' },
      { name: 'Micro-ondas Corporativo', volume: 0.12, category: 'cozinha' },
      { name: 'Mesa de Refeição / Copa', volume: 0.8, category: 'cozinha' },
      { name: 'Cadeiras / Banquetes de Copa', volume: 0.12, category: 'cozinha' },
      { name: 'Armário de Cozinha / Louceiro', volume: 0.6, category: 'cozinha' },
      { name: 'Cafeteira / Eletrodomésticos', volume: 0.1, category: 'cozinha' }
    ]
  },
  {
    id: 'arquivo_ti',
    name: 'Arquivo, TI & Servidores',
    icon: 'Package',
    items: [
      { name: 'Rack de Servidor / TI', volume: 1.0, category: 'escritorio' },
      { name: 'Armário de Aço / Arquivo Deslizante', volume: 1.2, category: 'escritorio' },
      { name: 'Estante de Aço Reforçada', volume: 0.7, category: 'escritorio' },
      { name: 'Caixa de Arquivo Morto / Pastas', volume: 0.05, category: 'caixas' },
      { name: 'Nobreak Grande / Equipamentos TI', volume: 0.15, category: 'escritorio' },
      { name: 'Cofre / Armário de Segurança', volume: 0.5, category: 'escritorio' }
    ]
  },
  {
    id: 'caixas_geral',
    name: 'Caixas e Embalados Corporativos',
    icon: 'Package',
    items: [
      { name: 'Caixa de Papelão Pequena (Documentos)', volume: 0.04, category: 'caixas' },
      { name: 'Caixa de Papelão Média (Periféricos/Material)', volume: 0.08, category: 'caixas' },
      { name: 'Caixa de Papelão Grande (Equipamentos)', volume: 0.15, category: 'caixas' },
      { name: 'Caixa Plástica Organizadora', volume: 0.08, category: 'caixas' }
    ]
  }
];

// Presets para Loja / Ponto Comercial
export const STORE_ROOM_PRESETS: RoomPreset[] = [
  {
    id: 'salao_vendas',
    name: 'Salão de Vendas & Vitrine',
    icon: 'Store',
    items: [
      { name: 'Balcão de Caixa / Atendimento', volume: 1.2, category: 'loja' },
      { name: 'Vitrine de Vidro / Expositor Iluminado', volume: 1.4, category: 'loja' },
      { name: 'Arara de Roupas / Expositor de Chão', volume: 0.6, category: 'loja' },
      { name: 'Manequim Completo', volume: 0.25, category: 'loja' },
      { name: 'Gôndola Central / Painel Canaletado', volume: 1.0, category: 'loja' },
      { name: 'Prateleiras Modulares de Parede', volume: 0.5, category: 'loja' },
      { name: 'Puff / Espelho de Provador', volume: 0.3, category: 'loja' },
      { name: 'Computador PDV / Gaveta de Dinheiro', volume: 0.2, category: 'loja' }
    ]
  },
  {
    id: 'estoque_deposito',
    name: 'Estoque & Depósito da Loja',
    icon: 'Package',
    items: [
      { name: 'Estante de Aço Industrial', volume: 1.0, category: 'loja' },
      { name: 'Escada de Depósito / Plataforma', volume: 0.4, category: 'loja' },
      { name: 'Carrinho de Carga / Transporte Manual', volume: 0.3, category: 'loja' },
      { name: 'Mesa de Triagem e Embalagem', volume: 0.8, category: 'loja' },
      { name: 'Caixa de Mercadoria Grande', volume: 0.15, category: 'caixas' },
      { name: 'Caixa de Mercadoria Média', volume: 0.08, category: 'caixas' }
    ]
  },
  {
    id: 'escritorio_loja',
    name: 'Escritório Administrativo & Apoio',
    icon: 'Briefcase',
    items: [
      { name: 'Mesa de Escritório', volume: 0.6, category: 'escritorio' },
      { name: 'Cadeira de Escritório', volume: 0.3, category: 'escritorio' },
      { name: 'Computador / Impressora Fiscal', volume: 0.2, category: 'escritorio' },
      { name: 'Armário / Cofre da Loja', volume: 0.6, category: 'escritorio' },
      { name: 'Micro-ondas / Frigobar da Loja', volume: 0.25, category: 'cozinha' }
    ]
  },
  {
    id: 'caixas_geral',
    name: 'Caixas e Embalados Gerais',
    icon: 'Package',
    items: [
      { name: 'Caixa de Papelão Pequena', volume: 0.04, category: 'caixas' },
      { name: 'Caixa de Papelão Média', volume: 0.08, category: 'caixas' },
      { name: 'Caixa de Papelão Grande', volume: 0.15, category: 'caixas' },
      { name: 'Caixa Plástica Organizadora', volume: 0.08, category: 'caixas' }
    ]
  }
];

export const ROOM_PRESETS = RESIDENTIAL_ROOM_PRESETS;

export function getRoomsForResidenceType(residenceType: string): RoomPreset[] {
  switch (residenceType) {
    case 'comercial':
      return OFFICE_ROOM_PRESETS;
    case 'loja':
      return STORE_ROOM_PRESETS;
    case 'casa':
    case 'sobrado':
    case 'apartamento':
    default:
      return RESIDENTIAL_ROOM_PRESETS;
  }
}

export const INITIAL_MATERIALS: MaterialItem[] = [
  {
    id: 'caixa_p',
    name: 'Caixa de Papelão Pequena',
    description: 'Ideal para livros, louças e objetos pesados.',
    quantity: 0,
    unit: 'unid.'
  },
  {
    id: 'caixa_m',
    name: 'Caixa de Papelão Média',
    description: 'Mais versátil. Perfeita para calçados, roupas e utilidades domésticas.',
    quantity: 0,
    unit: 'unid.'
  },
  {
    id: 'caixa_g',
    name: 'Caixa de Papelão Grande',
    description: 'Indicada para brinquedos, panelas e itens leves volumosos.',
    quantity: 0,
    unit: 'unid.'
  },
  {
    id: 'plastico_bolha',
    name: 'Plástico Bolha (Rolo 50 metros)',
    description: 'Excelente proteção de eletrônicos, vidros, espelhos e eletrodomésticos.',
    quantity: 0,
    unit: 'rolo'
  },
  {
    id: 'cabideiro_papelao',
    name: 'Porta-Terno / Cabideiro de Papelão',
    description: 'Facilita o transporte de ternos, vestidos e casacos sem amassar.',
    quantity: 0,
    unit: 'unid.'
  },
  {
    id: 'fita_adesiva',
    name: 'Fita Adesiva Acrílica Larga',
    description: 'Forte adesão, indispensável para fechar caixas com segurança.',
    quantity: 0,
    unit: 'rolo'
  },
  {
    id: 'papel_acoplado',
    name: 'Papel de Embalagem (Seda/Manilha)',
    description: 'Para embrulhar copos, pratos e enfeites sensíveis sem riscar.',
    quantity: 0,
    unit: 'pacote'
  },
  {
    id: 'filme_stretch',
    name: 'Filme Stretch com Aplicador',
    description: 'Envelopamento de gavetas, proteção contra poeira e fixação de mantas.',
    quantity: 0,
    unit: 'rolo'
  }
];

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'desmontagem',
    name: 'Desmontagem de Móveis',
    description: 'Nossos profissionais desmontarão guarda-roupas, camas e mesas complexas.',
    selected: false
  },
  {
    id: 'montagem',
    name: 'Montagem de Móveis no Destino',
    description: 'Montagem completa dos móveis desmontados no novo local.',
    selected: false
  },
  {
    id: 'embalamento_profissional',
    name: 'Embalamento Profissional dos Pertences',
    description: 'Embalamos livros, louças e roupas nas caixas de papelão por você.',
    selected: false
  },
  {
    id: 'ajudantes_extras',
    name: 'Ajudantes Adicionais',
    description: 'Para locais sem elevador ou com escadarias longas, acelerando o processo.',
    selected: false
  }
];

