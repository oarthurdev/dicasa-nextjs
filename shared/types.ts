// Kommo API Types
export interface KommoUserResponse {
  _embedded: {
    users: KommoUser[];
  };
  _links: {
    self: {
      href: string;
    };
  };
}

export interface KommoUser {
  id: number;
  name: string;
  email: string;
  role: string;
  group_id: number;
  is_active: boolean;
  created_at: number;
  updated_at: number;
  rights: {
    leads: {
      view: string[];
      edit: string[];
      delete: string[];
      export: string[];
    };
    contacts: {
      view: string[];
      edit: string[];
      delete: string[];
      export: string[];
    };
    catalogs: {
      view: string[];
      edit: string[];
      delete: string[];
      export: string[];
    };
    companies: {
      view: string[];
      edit: string[];
      delete: string[];
      export: string[];
    };
  };
}

export interface KommoLeadResponse {
  _embedded: {
    leads: KommoLead[];
  };
  _links: {
    self: {
      href: string;
    };
  };
}

export interface KommoLead {
  id: number;
  name: string;
  responsible_user_id: number;
  created_by: number;
  created_at: number;
  updated_at: number;
  account_id: number;
  pipeline_id: number;
  status_id: number;
  closed_at: number | null;
  closest_task_at: number | null;
  is_deleted: boolean;
  custom_fields_values: any[] | null;
  score: number | null;
  _embedded: {
    tags: any[];
    contacts: any[];
  };
}

export interface KommoActivityResponse {
  _embedded: {
    activities: KommoActivity[];
  };
  _links: {
    self: {
      href: string;
    };
  };
}

export interface KommoActivity {
  id: number;
  entity_id: number;
  entity_type: string;
  type: string;
  created_by: number;
  created_at: number;
  value_before: any;
  value_after: any;
}

// Dashboard types
export interface DashboardStats {
  leadsAtivos: number;
  propostas: number;
  visitas: number;
  vendas: number;
  weeklyComparison: {
    leadsAtivos: number;
    propostas: number;
    visitas: number;
    vendas: number;
  };
}

export interface BrokerCardProps {
  broker: {
    id: number;
    nome: string;
    avatar_url?: string;
    pontos: number;
    nivel_desempenho: 'alto' | 'medio' | 'baixo';
    leads_respondidos_1h: number;
    leads_visitados: number;
    propostas_enviadas: number;
    vendas_realizadas: number;
    leads_atuais?: number;
    updated_at: Date;
    resposta_rapida_3h?: number;
    leads_sem_interacao_24h?: number;
  };
}

export interface HeatmapData {
  dayOfWeek: string;
  timeBlock: string;
  count: number;
}

export interface ConversionFunnelData {
  stage: string;
  count: number;
}

export interface PropertyData {
  id: number;
  titulo: string;
  descricao?: string;
  preco: number;
  quartos: number;
  area: number;
  imagem_url?: string;
}

export interface ScoringRuleData {
  id: number;
  nome: string;
  descricao?: string;
  pontos: number;
  tipo: 'positive' | 'negative';
  ativo: boolean;
}

export interface AuthUser {
  id: number;
  username: string;
  nome: string;
  cargo: string;
  kommo_id?: number;
  avatar_url?: string;
}
