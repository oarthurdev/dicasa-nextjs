import { pgTable, text, integer, boolean, timestamp, real, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum for user roles
export const userRoleEnum = pgEnum('user_role', ['admin', 'administrador', 'corretor', 'gerente']);

// Enum for broker performance level
export const performanceLevelEnum = pgEnum('performance_level', ['alto', 'medio', 'baixo']);

// Users table
export const users = pgTable('users', {
  id: integer('id').primaryKey().notNull().default(sql`nextval('table_id_seq')`),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  nome: text('nome').notNull(),
  email: text('email'),
  cargo: userRoleEnum('cargo').default('corretor').notNull(),
  kommo_id: integer('kommo_id').unique(),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Leads table
export const leads = pgTable('leads', {
  id: integer('id').primaryKey().notNull().default(sql`nextval('table_id_seq')`),
  kommo_id: integer('kommo_id').unique(),
  nome: text('nome').notNull(),
  email: text('email'),
  telefone: text('telefone'),
  responsavel_id: integer('responsavel_id').references(() => users.id),
  status: text('status'),
  etapa_categoria: text('etapa_categoria'),
  fonte: text('fonte'),
  criado_em: timestamp('criado_em'),
  atualizado_em: timestamp('atualizado_em'),
  pipeline_id: integer('pipeline_id'),
  status_id: integer('status_id'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Activities table
export const activities = pgTable('activities', {
  id: text('id').primaryKey(),
  lead_id: integer('lead_id').references(() => leads.id),
  user_id: integer('user_id').references(() => users.id),
  tipo: text('tipo'),
  valor_antigo: text('valor_antigo'),
  valor_novo: text('valor_novo'),
  criado_em: timestamp('criado_em'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Broker performance points
export const brokerPoints = pgTable('broker_points', {
  id: integer('id').references(() => users.id).primaryKey(),
  nome: text('nome').notNull(),
  pontos: integer('pontos').default(0).notNull(),
  leads_respondidos_1h: integer('leads_respondidos_1h').default(0),
  leads_visitados: integer('leads_visitados').default(0),
  propostas_enviadas: integer('propostas_enviadas').default(0),
  vendas_realizadas: integer('vendas_realizadas').default(0),
  leads_atualizados_mesmo_dia: integer('leads_atualizados_mesmo_dia').default(0),
  feedback_positivo_gestor: integer('feedback_positivo_gestor').default(0),
  leads_sem_interacao_24h: integer('leads_sem_interacao_24h').default(0),
  leads_respondidos_apos_18h: integer('leads_respondidos_apos_18h').default(0),
  leads_tempo_resposta_acima_12h: integer('leads_tempo_resposta_acima_12h').default(0),
  leads_sem_mudanca_etapa_5dias: integer('leads_sem_mudanca_etapa_5dias').default(0),
  nivel_desempenho: performanceLevelEnum('nivel_desempenho').default('medio'),
  resposta_rapida_3h: integer('resposta_rapida_3h').default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Scoring rules table
export const scoringRules = pgTable('scoring_rules', {
  id: integer('id').primaryKey().notNull().default(sql`nextval('table_id_seq')`),
  nome: text('nome').notNull(),
  descricao: text('descricao'),
  pontos: integer('pontos').notNull(),
  tipo: text('tipo').notNull(), // "positive" or "negative"
  ativo: boolean('ativo').default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Properties table
export const properties = pgTable('properties', {
  id: integer('id').primaryKey().notNull().default(sql`nextval('table_id_seq')`),
  titulo: text('titulo').notNull(),
  descricao: text('descricao'),
  preco: real('preco'),
  quartos: integer('quartos'),
  banheiros: integer('banheiros'),
  area: real('area'),
  tipo: text('tipo'),
  imagem_url: text('imagem_url'),
  destaque: boolean('destaque').default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  leads: many(leads),
  activities: many(activities),
  brokerPoints: many(brokerPoints),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  responsavel: one(users, {
    fields: [leads.responsavel_id],
    references: [users.id],
  }),
  activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  lead: one(leads, {
    fields: [activities.lead_id],
    references: [leads.id],
  }),
  user: one(users, {
    fields: [activities.user_id],
    references: [users.id],
  }),
}));

export const brokerPointsRelations = relations(brokerPoints, ({ one }) => ({
  user: one(users, {
    fields: [brokerPoints.id],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users, {
  kommo_id: z.number().optional(),
  avatar_url: z.string().optional(),
}).omit({ id: true, created_at: true, updated_at: true });

export const insertLeadSchema = createInsertSchema(leads).omit({ 
  id: true, created_at: true, updated_at: true 
});

export const insertActivitySchema = createInsertSchema(activities).omit({ 
  created_at: true, updated_at: true 
});

export const insertBrokerPointsSchema = createInsertSchema(brokerPoints).omit({ 
  created_at: true, updated_at: true 
});

export const insertScoringRuleSchema = createInsertSchema(scoringRules).omit({ 
  id: true, created_at: true, updated_at: true 
});

export const insertPropertySchema = createInsertSchema(properties).omit({ 
  id: true, created_at: true, updated_at: true 
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type BrokerPoint = typeof brokerPoints.$inferSelect;
export type InsertBrokerPoint = z.infer<typeof insertBrokerPointsSchema>;

export type ScoringRule = typeof scoringRules.$inferSelect;
export type InsertScoringRule = z.infer<typeof insertScoringRuleSchema>;

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
