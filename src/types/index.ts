export interface User {
  id: string;
  email: string;
  name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number; // in cm
  weight?: number; // in kg
  fitness_goal?: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'endurance';
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';
  created_at: string;
}

export interface DietPlan {
  id: string;
  user_id: string;
  date: string;
  breakfast: MealPlan;
  lunch: MealPlan;
  dinner: MealPlan;
  snacks: MealPlan[];
  total_calories: number;
  created_at: string;
}

export interface MealPlan {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string;
  alternatives: string[];
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  type: 'home' | 'gym';
  duration: 3 | 5 | 7;
  exercises: Exercise[];
  created_at: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest_time: string;
  description: string;
  muscle_groups: string[];
  calories_burned?: number;
}

export interface ProgressEntry {
  id: string;
  user_id: string;
  weight: number;
  date: string;
  notes?: string;
}

export interface MotivationalTip {
  id: string;
  content: string;
  type: 'fitness' | 'nutrition' | 'mindset';
  created_at: string;
}