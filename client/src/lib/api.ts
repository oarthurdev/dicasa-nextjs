import { AuthUser, DashboardStats, HeatmapData, ConversionFunnelData, PropertyData } from '@shared/types';
import { BrokerPoint, ScoringRule } from '@shared/schema';
import { apiRequest } from './queryClient';

// Authentication
export async function loginUser(username: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const res = await apiRequest('post', '/api/auth/login', { username, password });
  const data = await res.json();
  
  // Store token in localStorage
  localStorage.setItem('token', data.token);
  
  return data;
}

export function logoutUser(): void {
  localStorage.removeItem('token');
}

export async function verifyToken(): Promise<AuthUser | null> {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const res = await apiRequest('post', '/api/auth/verify');
    const data = await res.json();
    return data.user;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Dashboard
export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await apiRequest('get', '/api/dashboard/stats');
  return await res.json();
}

export async function getBrokers(): Promise<BrokerPoint[]> {
  const res = await apiRequest('get', '/api/brokers');
  return await res.json();
}

export async function getBroker(id: number): Promise<BrokerPoint> {
  const res = await apiRequest('get', `/api/brokers/${id}`);
  return await res.json();
}

export async function getHeatmapData(): Promise<HeatmapData[]> {
  const res = await apiRequest('get', '/api/heatmap');
  return await res.json();
}

export async function getConversionFunnelData(): Promise<ConversionFunnelData[]> {
  const res = await apiRequest('get', '/api/conversion-funnel');
  return await res.json();
}

export async function getFeaturedProperties(limit: number = 4): Promise<PropertyData[]> {
  const res = await apiRequest('get', `/api/properties/featured?limit=${limit}`);
  return await res.json();
}

// Admin
export async function getScoringRules(): Promise<ScoringRule[]> {
  const res = await apiRequest('get', '/api/admin/rules');
  return await res.json();
}

export async function createScoringRule(rule: Omit<ScoringRule, 'id' | 'created_at' | 'updated_at'>): Promise<ScoringRule> {
  const res = await apiRequest('post', '/api/admin/rules', rule);
  return await res.json();
}

export async function updateScoringRule(id: number, rule: Partial<ScoringRule>): Promise<ScoringRule> {
  const res = await apiRequest('put', `/api/admin/rules/${id}`, rule);
  return await res.json();
}

export async function triggerSync(): Promise<{ message: string }> {
  const res = await apiRequest('post', '/api/admin/sync');
  return await res.json();
}

export async function getSyncStatus(): Promise<{ users: string; leads: string; activities: string }> {
  const res = await apiRequest('get', '/api/admin/sync/status');
  return await res.json();
}
