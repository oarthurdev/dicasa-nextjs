import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import authRoutes from "./api/auth";
import { syncData, forceSyncAll, getLastSyncTime } from "./api/sync";
import { calculateBrokerStats } from "./api/brokers";
import oauthRoutes from "./api/oauth";
import { z } from "zod";
import { 
  insertUserSchema, insertScoringRuleSchema, insertPropertySchema
} from "@shared/schema";

// Auth middleware
function authMiddleware(req: Request, res: Response, next: Function) {
  // Check if user is authenticated via session
  if (req.session && req.session.userId) {
    // User is authenticated via session
    (req as any).userId = req.session.userId;
    next();
    return;
  }
  
  // No session, so deny access
  return res.status(401).json({ message: 'Authentication required' });
}

// Admin middleware
function adminMiddleware(req: Request, res: Response, next: Function) {
  const userId = (req as any).userId;
  
  if (!userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // Get user from storage
  storage.getUser(userId).then(user => {
    if (!user || user.cargo !== 'administrador') {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    next();
  }).catch(error => {
    console.error('Error checking admin status:', error);
    return res.status(500).json({ message: 'Server error checking authorization' });
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Register OAuth routes
  app.use('/api/oauth', oauthRoutes);

  // Start the sync process
  // In production, you'd want to use a proper job scheduler
  setInterval(syncData, 5 * 60 * 1000); // Run every 5 minutes
  
  // Register auth routes
  app.use('/api/auth', authRoutes);

  // Dashboard data endpoints
  app.get('/api/dashboard/stats', authMiddleware, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      
      // Get stats from a week ago for comparison
      // In a real application, you'd store historical data
      // This is a simplified placeholder
      const weeklyComparison = {
        leadsAtivos: Math.floor(stats.leadsAtivos * 0.9), // Assuming 10% growth
        propostas: Math.floor(stats.propostas * 0.85),
        visitas: Math.floor(stats.visitas * 0.95),
        vendas: Math.floor(stats.vendas * 0.75)
      };
      
      res.json({
        ...stats,
        weeklyComparison
      });
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      res.status(500).json({ message: 'Failed to get dashboard stats' });
    }
  });
  
  app.get('/api/brokers', authMiddleware, async (req, res) => {
    try {
      const brokerPoints = await storage.listBrokerPoints();
      res.json(brokerPoints);
    } catch (error) {
      console.error('Error getting brokers:', error);
      res.status(500).json({ message: 'Failed to get brokers' });
    }
  });
  
  app.get('/api/brokers/:id', authMiddleware, async (req, res) => {
    try {
      const brokerId = parseInt(req.params.id);
      const brokerPoints = await storage.getBrokerPoints(brokerId);
      
      if (!brokerPoints) {
        // If no points record exists, try to calculate on the fly
        const brokerStats = await calculateBrokerStats(brokerId);
        if (brokerStats) {
          res.json(brokerStats);
        } else {
          res.status(404).json({ message: 'Broker not found' });
        }
      } else {
        res.json(brokerPoints);
      }
    } catch (error) {
      console.error('Error getting broker:', error);
      res.status(500).json({ message: 'Failed to get broker' });
    }
  });
  
  app.get('/api/heatmap', authMiddleware, async (req, res) => {
    try {
      const heatmapData = await storage.getHeatmapData();
      res.json(heatmapData);
    } catch (error) {
      console.error('Error getting heatmap data:', error);
      res.status(500).json({ message: 'Failed to get heatmap data' });
    }
  });
  
  app.get('/api/conversion-funnel', authMiddleware, async (req, res) => {
    try {
      const funnelData = await storage.getConversionFunnelData();
      res.json(funnelData);
    } catch (error) {
      console.error('Error getting funnel data:', error);
      res.status(500).json({ message: 'Failed to get funnel data' });
    }
  });
  
  app.get('/api/properties/featured', authMiddleware, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      const featuredProperties = await storage.getFeaturedProperties(limit);
      res.json(featuredProperties);
    } catch (error) {
      console.error('Error getting featured properties:', error);
      res.status(500).json({ message: 'Failed to get featured properties' });
    }
  });

  // Admin endpoints
  app.get('/api/admin/rules', authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const rules = await storage.listScoringRules();
      res.json(rules);
    } catch (error) {
      console.error('Error getting scoring rules:', error);
      res.status(500).json({ message: 'Failed to get scoring rules' });
    }
  });
  
  app.post('/api/admin/rules', authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const ruleData = req.body;
      
      // Validate rule data
      const validatedData = insertScoringRuleSchema.parse(ruleData);
      
      const rule = await storage.createScoringRule(validatedData);
      res.status(201).json(rule);
    } catch (error) {
      console.error('Error creating scoring rule:', error);
      res.status(400).json({ message: 'Invalid rule data', error: String(error) });
    }
  });
  
  app.put('/api/admin/rules/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const ruleId = parseInt(req.params.id);
      const ruleData = req.body;
      
      // Validate rule data
      const validatedData = z.object({
        nome: z.string().optional(),
        descricao: z.string().optional(),
        pontos: z.number().optional(),
        tipo: z.enum(['positive', 'negative']).optional(),
        ativo: z.boolean().optional()
      }).parse(ruleData);
      
      const rule = await storage.updateScoringRule(ruleId, validatedData);
      
      if (!rule) {
        return res.status(404).json({ message: 'Rule not found' });
      }
      
      res.json(rule);
    } catch (error) {
      console.error('Error updating scoring rule:', error);
      res.status(400).json({ message: 'Invalid rule data', error: String(error) });
    }
  });
  
  app.post('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const userData = req.body;
      
      // Validate user data
      const validatedData = insertUserSchema.parse(userData);
      
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(400).json({ message: 'Invalid user data', error: String(error) });
    }
  });
  
  app.post('/api/admin/properties', authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const propertyData = req.body;
      
      // Validate property data
      const validatedData = insertPropertySchema.parse(propertyData);
      
      const property = await storage.createProperty(validatedData);
      res.status(201).json(property);
    } catch (error) {
      console.error('Error creating property:', error);
      res.status(400).json({ message: 'Invalid property data', error: String(error) });
    }
  });
  
  app.post('/api/admin/sync', authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const success = await forceSyncAll();
      
      if (success) {
        res.json({ message: 'Sync completed successfully' });
      } else {
        res.status(500).json({ message: 'Sync failed' });
      }
    } catch (error) {
      console.error('Error during sync:', error);
      res.status(500).json({ message: 'Sync failed', error: String(error) });
    }
  });
  
  app.get('/api/admin/sync/status', authMiddleware, adminMiddleware, (req, res) => {
    const lastSyncTimes = getLastSyncTime();
    res.json(lastSyncTimes);
  });

  // Initialize HTTP server
  const httpServer = createServer(app);

  // Initialize database with default scoring rules
  try {
    const rules = await storage.listScoringRules();
    
    if (rules.length === 0) {
      console.log('Initializing default scoring rules...');
      
      const defaultRules = [
        {
          nome: 'Lead respondido em até 1 hora',
          descricao: 'Pontos por responder lead em até 1 hora',
          pontos: 2,
          tipo: 'positive',
          ativo: true
        },
        {
          nome: 'Lead visitado',
          descricao: 'Pontos por visita realizada com lead',
          pontos: 5,
          tipo: 'positive',
          ativo: true
        },
        {
          nome: 'Proposta enviada',
          descricao: 'Pontos por proposta enviada ao cliente',
          pontos: 8,
          tipo: 'positive',
          ativo: true
        },
        {
          nome: 'Venda realizada',
          descricao: 'Pontos por venda concretizada',
          pontos: 15,
          tipo: 'positive',
          ativo: true
        },
        {
          nome: 'Lead atualizado no CRM no mesmo dia',
          descricao: 'Pontos por atualizar lead no CRM no mesmo dia',
          pontos: 2,
          tipo: 'positive',
          ativo: true
        },
        {
          nome: 'Feedback positivo do gestor',
          descricao: 'Pontos por feedback positivo recebido',
          pontos: 3,
          tipo: 'positive',
          ativo: true
        },
        {
          nome: 'Lead sem interação há mais de 24h',
          descricao: 'Pontos negativos por lead sem interação por mais de 24h',
          pontos: 3,
          tipo: 'negative',
          ativo: true
        }
      ];
      
      for (const rule of defaultRules) {
        await storage.createScoringRule(rule as any);
      }
    }
  } catch (error) {
    console.error('Error initializing default rules:', error);
  }

  // Start the initial sync
  syncData().then(() => {
    console.log('Initial data sync completed');
  }).catch(error => {
    console.error('Initial data sync failed:', error);
  });

  return httpServer;
}
