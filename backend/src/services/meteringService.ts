// Simple in-memory metering for development
// In production, this would use a database

interface UserUsage {
  monthlyRewrites: number;
  monthlyTokens: number;
  lastReset: Date;
}

class MeteringService {
  private usage: Map<string, UserUsage> = new Map();

  async checkQuota(userId: string, model: string): Promise<boolean> {
    // For development, always allow requests
    return true;
  }

  async recordUsage(userId: string, model: string, tokensUsed: number): Promise<void> {
    const now = new Date();
    const userUsage = this.usage.get(userId) || {
      monthlyRewrites: 0,
      monthlyTokens: 0,
      lastReset: now
    };

    // Reset monthly counters if it's a new month
    if (this.isNewMonth(userUsage.lastReset, now)) {
      userUsage.monthlyRewrites = 0;
      userUsage.monthlyTokens = 0;
      userUsage.lastReset = now;
    }

    userUsage.monthlyRewrites += 1;
    userUsage.monthlyTokens += tokensUsed;

    this.usage.set(userId, userUsage);
  }

  async getUserUsage(userId: string): Promise<UserUsage | null> {
    return this.usage.get(userId) || null;
  }

  private isNewMonth(lastReset: Date, now: Date): boolean {
    return lastReset.getMonth() !== now.getMonth() || 
           lastReset.getFullYear() !== now.getFullYear();
  }
}

export const meteringService = new MeteringService();
