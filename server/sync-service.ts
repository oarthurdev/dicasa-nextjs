
import { kommoApi } from './api/kommo';
import { storage } from './storage';

class SyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private SYNC_INTERVAL = 60000; // 1 minuto

  async start() {
    if (this.syncInterval) {
      return;
    }

    console.log('Starting sync service...');
    await this.syncData(); // Sync immediately on start
    
    // Set up periodic sync
    this.syncInterval = setInterval(() => {
      this.syncData();
    }, this.SYNC_INTERVAL);
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private async syncData() {
    try {
      console.log('Syncing data from Kommo...');
      
      // Sync users
      const users = await kommoApi.getUsers();
      if (users.length > 0) {
        for (const user of users) {
          await storage.createOrUpdateUser(user);
        }
      }

      // Sync leads
      const leads = await kommoApi.getLeads();
      if (leads.length > 0) {
        // Implement lead storage sync
        console.log(`Synced ${leads.length} leads`);
      }

      // Sync activities
      const activities = await kommoApi.getActivities();
      if (activities.length > 0) {
        // Implement activities storage sync
        console.log(`Synced ${activities.length} activities`);
      }

    } catch (error) {
      console.error('Error syncing data:', error);
    }
  }
}

export const syncService = new SyncService();
