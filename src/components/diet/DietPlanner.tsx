import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { generateDietPlan } from '../../services/mockAI';
import { StorageService, AUTH_KEYS } from '../../services/storage';
import type { DietPlan } from '../../types';
import { Utensils, Clock, Zap, Users } from 'lucide-react';

export function DietPlanner() {
  const { user } = useAuth();
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks'>('breakfast');

  useEffect(() => {
    if (user) {
      loadUserDietPlan();
    }
  }, [user]);

  const loadUserDietPlan = () => {
    const dietPlans = StorageService.getItem<DietPlan[]>(AUTH_KEYS.DIET_PLANS) || [];
    const userDietPlan = dietPlans.find(plan => plan.user_id === user?.id);
    setDietPlan(userDietPlan || null);
  };

  const handleGeneratePlan = async () => {
    if (!user) return;
    
    setLoading(true);
    const newDietPlan = generateDietPlan(user);
    
    // Save to storage
    const existingPlans = StorageService.getItem<DietPlan[]>(AUTH_KEYS.DIET_PLANS) || [];
    const filteredPlans = existingPlans.filter(plan => plan.user_id !== user.id);
    filteredPlans.push(newDietPlan);
    StorageService.setItem(AUTH_KEYS.DIET_PLANS, filteredPlans);
    
    setDietPlan(newDietPlan);
    setLoading(false);
  };

  const getMealData = () => {
    if (!dietPlan) return null;
    
    switch (selectedMeal) {
      case 'breakfast':
        return dietPlan.breakfast;
      case 'lunch':
        return dietPlan.lunch;
      case 'dinner':
        return dietPlan.dinner;
      case 'snacks':
        return dietPlan.snacks[0];
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Diet Planner
        </h1>
        <p className="text-gray-600">Personalized meal plans tailored to your fitness goals</p>
      </div>

      {!dietPlan ? (
        <Card className="text-center py-12">
          <Utensils className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Your AI Diet Plan</h2>
          <p className="text-gray-600 mb-6">
            Get a personalized meal plan based on your fitness goals and preferences
          </p>
          <Button 
            onClick={handleGeneratePlan}
            loading={loading}
            size="lg"
            variant="secondary"
          >
            Generate Diet Plan
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Diet Plan Overview */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Target Calories:</span>
                  <span className="font-semibold">{dietPlan.total_calories}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full" 
                    style={{width: '75%'}}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">Progress: 75% of daily goal</p>
              </div>
            </Card>

            {/* Meal Navigation */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Meals</h3>
              <div className="space-y-2">
                {[
                  { key: 'breakfast', label: 'Breakfast', icon: '🍳', calories: dietPlan.breakfast.calories },
                  { key: 'lunch', label: 'Lunch', icon: '🥗', calories: dietPlan.lunch.calories },
                  { key: 'dinner', label: 'Dinner', icon: '🍽️', calories: dietPlan.dinner.calories },
                  { key: 'snacks', label: 'Snacks', icon: '🍎', calories: dietPlan.snacks[0]?.calories || 0 },
                ].map((meal) => (
                  <button
                    key={meal.key}
                    onClick={() => setSelectedMeal(meal.key as any)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                      selectedMeal === meal.key
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{meal.icon}</span>
                      <span className="font-medium">{meal.label}</span>
                    </div>
                    <span className="text-sm text-gray-600">{meal.calories} cal</span>
                  </button>
                ))}
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={handleGeneratePlan}
                loading={loading}
              >
                Generate New Plan
              </Button>
            </Card>
          </div>

          {/* Meal Details */}
          <div className="lg:col-span-2">
            {getMealData() && (
              <Card>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {getMealData()!.name}
                  </h2>
                  
                  {/* Nutrition Info */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <Zap className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-sm text-gray-600">Calories</p>
                      <p className="font-bold text-blue-600">{getMealData()!.calories}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <Users className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <p className="text-sm text-gray-600">Protein</p>
                      <p className="font-bold text-green-600">{getMealData()!.protein}g</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <Clock className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                      <p className="text-sm text-gray-600">Carbs</p>
                      <p className="font-bold text-yellow-600">{getMealData()!.carbs}g</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="w-5 h-5 bg-purple-600 rounded-full mx-auto mb-1"></div>
                      <p className="text-sm text-gray-600">Fat</p>
                      <p className="font-bold text-purple-600">{getMealData()!.fat}g</p>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Ingredients</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {getMealData()!.ingredients.map((ingredient, index) => (
                        <span 
                          key={index}
                          className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700"
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h3>
                    <p className="text-gray-700 leading-relaxed">{getMealData()!.instructions}</p>
                  </div>

                  {/* Alternatives */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Healthy Alternatives</h3>
                    <div className="space-y-2">
                      {getMealData()!.alternatives.map((alternative, index) => (
                        <div key={index} className="flex items-center p-2 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <span className="text-gray-700">{alternative}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}