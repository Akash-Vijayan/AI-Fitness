// Local Storage Service for data persistence
export class StorageService {
  static setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  static getItem<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  static clear(): void {
    localStorage.clear();
  }
}

// Authentication Storage Keys
export const AUTH_KEYS = {
  CURRENT_USER: 'fitness_app_current_user',
  USERS: 'fitness_app_users',
  DIET_PLANS: 'fitness_app_diet_plans',
  WORKOUT_PLANS: 'fitness_app_workout_plans',
  PROGRESS_ENTRIES: 'fitness_app_progress_entries',
  MOTIVATIONAL_TIPS: 'fitness_app_tips',
};