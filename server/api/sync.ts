import { kommoApi } from './kommo';
import { storage } from '../storage';

// Registra os tempos de última sincronização
const lastSyncTimes: Record<string, Date> = {
  users: new Date(0),
  leads: new Date(0),
  activities: new Date(0)
};

/**
 * Sincroniza dados do Kommo para o banco de dados local
 */
export async function syncData(): Promise<boolean> {
  try {
    // Sincronizar usuários
    console.log('Syncing users from Kommo...');
    const users = await kommoApi.getUsers();
    if (users.length > 0) {
      lastSyncTimes.users = new Date();
    }

    // Sincronizar leads
    console.log('Syncing leads from Kommo...');
    const leads = await kommoApi.getLeads();
    if (leads.length > 0) {
      lastSyncTimes.leads = new Date();
    }

    // Sincronizar atividades
    console.log('Syncing activities from Kommo...');
    const activities = await kommoApi.getActivities();
    if (activities.length > 0) {
      lastSyncTimes.activities = new Date();
    }

    return true;
  } catch (error) {
    console.error('Error syncing data from Kommo:', error);
    return false;
  }
}

/**
 * Força a sincronização completa de todos os dados
 */
export async function forceSyncAll(): Promise<boolean> {
  try {
    lastSyncTimes.users = new Date(0);
    lastSyncTimes.leads = new Date(0);
    lastSyncTimes.activities = new Date(0);
    
    return await syncData();
  } catch (error) {
    console.error('Error forcing sync:', error);
    return false;
  }
}

/**
 * Retorna os tempos de última sincronização
 */
export function getLastSyncTime(): Record<string, string> {
  return {
    users: lastSyncTimes.users.toISOString(),
    leads: lastSyncTimes.leads.toISOString(),
    activities: lastSyncTimes.activities.toISOString()
  };
}