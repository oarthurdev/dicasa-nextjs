import {
  User,
  InsertUser,
  Lead,
  InsertLead,
  Activity,
  InsertActivity,
  BrokerPoint,
  InsertBrokerPoint,
  ScoringRule,
  InsertScoringRule,
  Property,
  InsertProperty,
} from "@shared/schema";
import { db } from "./db";
import {
  eq,
  and,
  like,
  desc,
  asc,
  gte,
  lte,
  isNotNull,
  count,
} from "drizzle-orm";
import {
  users,
  leads,
  activities,
  brokerPoints,
  scoringRules,
  properties,
} from "@shared/schema";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByKommoId(kommoId: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  listUsers(): Promise<User[]>;

  // Lead methods
  getLead(id: number): Promise<Lead | undefined>;
  getLeadByKommoId(kommoId: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, data: Partial<InsertLead>): Promise<Lead | undefined>;
  listLeads(): Promise<Lead[]>;
  getLeadsByResponsavelId(responsavelId: number): Promise<Lead[]>;

  // Activity methods
  getActivity(id: string): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  listActivities(): Promise<Activity[]>;
  getActivitiesByLeadId(leadId: number): Promise<Activity[]>;
  getActivitiesByUserId(userId: number): Promise<Activity[]>;

  // Broker Points methods
  getBrokerPoints(id: number): Promise<BrokerPoint | undefined>;
  createOrUpdateBrokerPoints(points: InsertBrokerPoint): Promise<BrokerPoint>;
  listBrokerPoints(): Promise<BrokerPoint[]>;

  // Scoring Rule methods
  getScoringRule(id: number): Promise<ScoringRule | undefined>;
  createScoringRule(rule: InsertScoringRule): Promise<ScoringRule>;
  updateScoringRule(
    id: number,
    data: Partial<InsertScoringRule>,
  ): Promise<ScoringRule | undefined>;
  listScoringRules(): Promise<ScoringRule[]>;

  // Property methods
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(
    id: number,
    data: Partial<InsertProperty>,
  ): Promise<Property | undefined>;
  listProperties(): Promise<Property[]>;
  getFeaturedProperties(limit?: number): Promise<Property[]>;

  // Dashboard specific methods
  getDashboardStats(): Promise<{
    leadsAtivos: number;
    propostas: number;
    visitas: number;
    vendas: number;
  }>;
  getHeatmapData(): Promise<
    {
      dayOfWeek: string;
      timeBlock: string;
      count: number;
    }[]
  >;
  getConversionFunnelData(): Promise<
    {
      stage: string;
      count: number;
    }[]
  >;
  validateCredentials(username: string, password: string): Promise<User | null>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async getUserByKommoId(kommoId: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.kommo_id, kommoId));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const [user] = await db
      .insert(users)
      .values({ ...userData, password: hashedPassword })
      .returning();
    return user;
  }

  async updateUser(
    id: number,
    userData: Partial<InsertUser>,
  ): Promise<User | undefined> {
    // If password is provided, hash it
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const [user] = await db
      .update(users)
      .set({ ...userData, updated_at: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createOrUpdateUser(userData: InsertUser): Promise<User> {
    // Check if user exists by kommo_id or username
    const existingUserByKommo = await this.getUserByKommoId(userData.kommo_id);
    const existingUserByUsername = await this.getUserByUsername(userData.username);
    const existingUser = existingUserByKommo || existingUserByUsername;
    
    if (existingUser) {
      // Update existing user
      const updatedUser = await this.updateUser(existingUser.id, userData);
      if (!updatedUser) {
        throw new Error('Failed to update user');
      }
      return updatedUser;
    } else {
      // Create new user without specifying ID
      const { id, ...userDataWithoutId } = userData;
      return await this.createUser(userDataWithoutId);
    }
  }

  async listUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(users.nome);
  }

  // Lead methods
  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async getLeadByKommoId(kommoId: number): Promise<Lead | undefined> {
    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.kommo_id, kommoId));
    return lead;
  }

  async createLead(leadData: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(leadData).returning();
    return lead;
  }

  async updateLead(
    id: number,
    leadData: Partial<InsertLead>,
  ): Promise<Lead | undefined> {
    const [lead] = await db
      .update(leads)
      .set({ ...leadData, updated_at: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return lead;
  }

  async listLeads(): Promise<Lead[]> {
    return db.select().from(leads).orderBy(desc(leads.atualizado_em));
  }

  async getLeadsByResponsavelId(responsavelId: number): Promise<Lead[]> {
    return db
      .select()
      .from(leads)
      .where(eq(leads.responsavel_id, responsavelId))
      .orderBy(desc(leads.atualizado_em));
  }

  // Activity methods
  async getActivity(id: string): Promise<Activity | undefined> {
    const [activity] = await db
      .select()
      .from(activities)
      .where(eq(activities.id, id));
    return activity;
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(activityData)
      .returning();
    return activity;
  }

  async listActivities(): Promise<Activity[]> {
    return db.select().from(activities).orderBy(desc(activities.criado_em));
  }

  async getActivitiesByLeadId(leadId: number): Promise<Activity[]> {
    return db
      .select()
      .from(activities)
      .where(eq(activities.lead_id, leadId))
      .orderBy(desc(activities.criado_em));
  }

  async getActivitiesByUserId(userId: number): Promise<Activity[]> {
    return db
      .select()
      .from(activities)
      .where(eq(activities.user_id, userId))
      .orderBy(desc(activities.criado_em));
  }

  // Broker Points methods
  async getBrokerPoints(id: number): Promise<BrokerPoint | undefined> {
    const [brokerPoint] = await db
      .select()
      .from(brokerPoints)
      .where(eq(brokerPoints.id, id));
    return brokerPoint;
  }

  async createOrUpdateBrokerPoints(
    pointsData: InsertBrokerPoint,
  ): Promise<BrokerPoint> {
    // Try to update first
    const [existing] = await db
      .select()
      .from(brokerPoints)
      .where(eq(brokerPoints.id, pointsData.id));

    if (existing) {
      const [updated] = await db
        .update(brokerPoints)
        .set({ ...pointsData, updated_at: new Date() })
        .where(eq(brokerPoints.id, pointsData.id))
        .returning();
      return updated;
    } else {
      // If not exists, insert
      const [inserted] = await db
        .insert(brokerPoints)
        .values(pointsData)
        .returning();
      return inserted;
    }
  }

  async listBrokerPoints(): Promise<BrokerPoint[]> {
    return db.select().from(brokerPoints).orderBy(desc(brokerPoints.pontos));
  }

  // Scoring Rule methods
  async getScoringRule(id: number): Promise<ScoringRule | undefined> {
    const [rule] = await db
      .select()
      .from(scoringRules)
      .where(eq(scoringRules.id, id));
    return rule;
  }

  async createScoringRule(ruleData: InsertScoringRule): Promise<ScoringRule> {
    const [rule] = await db.insert(scoringRules).values(ruleData).returning();
    return rule;
  }

  async updateScoringRule(
    id: number,
    ruleData: Partial<InsertScoringRule>,
  ): Promise<ScoringRule | undefined> {
    const [rule] = await db
      .update(scoringRules)
      .set({ ...ruleData, updated_at: new Date() })
      .where(eq(scoringRules.id, id))
      .returning();
    return rule;
  }

  async listScoringRules(): Promise<ScoringRule[]> {
    return db
      .select()
      .from(scoringRules)
      .orderBy(scoringRules.tipo, desc(scoringRules.pontos));
  }

  // Property methods
  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id));
    return property;
  }

  async createProperty(propertyData: InsertProperty): Promise<Property> {
    const [property] = await db
      .insert(properties)
      .values(propertyData)
      .returning();
    return property;
  }

  async updateProperty(
    id: number,
    propertyData: Partial<InsertProperty>,
  ): Promise<Property | undefined> {
    const [property] = await db
      .update(properties)
      .set({ ...propertyData, updated_at: new Date() })
      .where(eq(properties.id, id))
      .returning();
    return property;
  }

  async listProperties(): Promise<Property[]> {
    return db.select().from(properties).orderBy(desc(properties.created_at));
  }

  async getFeaturedProperties(limit: number = 4): Promise<Property[]> {
    return db
      .select()
      .from(properties)
      .where(eq(properties.destaque, true))
      .limit(limit)
      .orderBy(desc(properties.created_at));
  }

  // Dashboard specific methods
  async getDashboardStats(): Promise<{
    leadsAtivos: number;
    propostas: number;
    visitas: number;
    vendas: number;
  }> {
    // Count active leads
    const [leadsResult] = await db
      .select({ count: count() })
      .from(leads)
      .where(and(eq(leads.status, "Aberto"), isNotNull(leads.status)));

    // Count proposals
    const proposalsActivities = await db
      .select()
      .from(activities)
      .where(like(activities.valor_novo, "%Proposta%"));

    // Count visits
    const visitActivities = await db
      .select()
      .from(activities)
      .where(like(activities.valor_novo, "%Visita%"));

    // Count completed sales
    const [salesResult] = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.status, "Ganho"));

    return {
      leadsAtivos: leadsResult?.count || 0,
      propostas: proposalsActivities.length || 0,
      visitas: visitActivities.length || 0,
      vendas: salesResult?.count || 0,
    };
  }

  async getHeatmapData(): Promise<
    { dayOfWeek: string; timeBlock: string; count: number }[]
  > {
    // This query needs to be adapted based on your specific database structure
    // Here's a simplified implementation
    const dayMapping: { [key: number]: string } = {
      0: "Domingo",
      1: "Segunda",
      2: "Terça",
      3: "Quarta",
      4: "Quinta",
      5: "Sexta",
      6: "Sábado",
    };

    const allActivities = await db.select().from(activities);

    // Process data to create heatmap structure
    const heatmapData: { [key: string]: { [key: string]: number } } = {
      Segunda: {
        "08h - 10h": 0,
        "10h - 12h": 0,
        "12h - 14h": 0,
        "14h - 16h": 0,
        "16h - 18h": 0,
        "Pós 18h": 0,
      },
      Terça: {
        "08h - 10h": 0,
        "10h - 12h": 0,
        "12h - 14h": 0,
        "14h - 16h": 0,
        "16h - 18h": 0,
        "Pós 18h": 0,
      },
      Quarta: {
        "08h - 10h": 0,
        "10h - 12h": 0,
        "12h - 14h": 0,
        "14h - 16h": 0,
        "16h - 18h": 0,
        "Pós 18h": 0,
      },
      Quinta: {
        "08h - 10h": 0,
        "10h - 12h": 0,
        "12h - 14h": 0,
        "14h - 16h": 0,
        "16h - 18h": 0,
        "Pós 18h": 0,
      },
      Sexta: {
        "08h - 10h": 0,
        "10h - 12h": 0,
        "12h - 14h": 0,
        "14h - 16h": 0,
        "16h - 18h": 0,
        "Pós 18h": 0,
      },
      Sábado: {
        "08h - 10h": 0,
        "10h - 12h": 0,
        "12h - 14h": 0,
        "14h - 16h": 0,
        "16h - 18h": 0,
        "Pós 18h": 0,
      },
    };

    // Map activities to day and time blocks
    for (const activity of allActivities) {
      if (activity.criado_em) {
        const date = new Date(activity.criado_em);
        const dayOfWeek = dayMapping[date.getDay()];
        const hour = date.getHours();

        let timeBlock = "Pós 18h";
        if (hour >= 8 && hour < 10) timeBlock = "08h - 10h";
        else if (hour >= 10 && hour < 12) timeBlock = "10h - 12h";
        else if (hour >= 12 && hour < 14) timeBlock = "12h - 14h";
        else if (hour >= 14 && hour < 16) timeBlock = "14h - 16h";
        else if (hour >= 16 && hour < 18) timeBlock = "16h - 18h";

        if (heatmapData[dayOfWeek]) {
          heatmapData[dayOfWeek][timeBlock]++;
        }
      }
    }

    // Convert to array format
    const result = [];
    for (const day in heatmapData) {
      for (const timeBlock in heatmapData[day]) {
        result.push({
          dayOfWeek: day,
          timeBlock,
          count: heatmapData[day][timeBlock],
        });
      }
    }

    return result;
  }

  async getConversionFunnelData(): Promise<{ stage: string; count: number }[]> {
    // Count leads in each funnel stage
    const contatoInicial = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.etapa_categoria, "Contato Inicial"));

    const visita = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.etapa_categoria, "Visita"));

    const proposta = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.etapa_categoria, "Proposta"));

    const venda = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.etapa_categoria, "Venda"));

    return [
      { stage: "Contato Inicial", count: contatoInicial[0]?.count || 0 },
      { stage: "Visita", count: visita[0]?.count || 0 },
      { stage: "Proposta", count: proposta[0]?.count || 0 },
      { stage: "Venda", count: venda[0]?.count || 0 },
    ];
  }

  async validateCredentials(
    username: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.getUserByUsername(username);

    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (isValid) {
      return user;
    }

    return null;
  }
}

export const storage = new DatabaseStorage();
