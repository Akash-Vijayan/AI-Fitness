import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { generateWorkoutPlan } from '../../services/mockAI';
import { StorageService, AUTH_KEYS } from '../../services/storage';
import type { WorkoutPlan } from '../../types';
import { Dumbbell, Home, Building, Clock, Target } from 'lucide-react';

export function WorkoutPlanner() {
  const { user } = useAuth();
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'home' | 'gym'>('home');
  const [selectedDuration, setSelectedDuration] = useState<3 | 5 | 7>(5);

  useEffect(() => {
    if (user) {
      loadUserWorkoutPlan();
    }
  }, [user]);

  const loadUserWorkoutPlan = () => {
    const workoutPlans = StorageService.getItem<WorkoutPlan[]>(AUTH_KEYS.WORKOUT_PLANS) || [];
    const userWorkoutPlan = workoutPlans.find(plan => plan.user_id === user?.id);
    setWorkoutPlan(userWorkoutPlan || null);
    
    if (userWorkoutPlan) {
      setSelectedType(userWorkoutPlan.type);
      setSelectedDuration(userWorkoutPlan.duration);
    }
  };

  const handleGeneratePlan = async () => {
    if (!user) return;
    
    setLoading(true);
    const newWorkoutPlan = generateWorkoutPlan(user, selectedType, selectedDuration);
    
    // Save to storage
    const existingPlans = StorageService.getItem<WorkoutPlan[]>(AUTH_KEYS.WORKOUT_PLANS) || [];
    const filteredPlans = existingPlans.filter(plan => plan.user_id !== user.id);
    filteredPlans.push(newWorkoutPlan);
    StorageService.setItem(AUTH_KEYS.WORKOUT_PLANS, filteredPlans);
    
    setWorkoutPlan(newWorkoutPlan);
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Workout Planner
        </h1>
        <p className="text-gray-600">Custom workout plans designed for your fitness level and goals</p>
      </div>

      {/* Plan Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Workout Type Selection */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Workout Type</h3>
          <div className="space-y-3">
            <button
              onClick={() => setSelectedType('home')}
              className={`w-full flex items-center p-4 rounded-lg border-2 transition-all ${
                selectedType === 'home'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Home className="w-6 h-6 mr-3 text-blue-600" />
              <div className="text-left">
                <h4 className="font-semibold">Home Workout</h4>
                <p className="text-sm text-gray-600">Bodyweight exercises, no equipment needed</p>
              </div>
            </button>
            
            <button
              onClick={() => setSelectedType('gym')}
              className={`w-full flex items-center p-4 rounded-lg border-2 transition-all ${
                selectedType === 'gym'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Building className="w-6 h-6 mr-3 text-blue-600" />
              <div className="text-left">
                <h4 className="font-semibold">Gym Workout</h4>
                <p className="text-sm text-gray-600">Full equipment access, compound movements</p>
              </div>
            </button>
          </div>
        </Card>

        {/* Duration Selection */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Plan Duration</h3>
          <div className="grid grid-cols-3 gap-3">
            {[3, 5, 7].map((days) => (
              <button
                key={days}
                onClick={() => setSelectedDuration(days as 3 | 5 | 7)}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  selectedDuration === days
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-bold text-lg">{days}</div>
                <div className="text-sm text-gray-600">Days</div>
              </button>
            ))}
          </div>
          
          <Button 
            onClick={handleGeneratePlan}
            loading={loading}
            className="w-full mt-4"
          >
            Generate Workout Plan
          </Button>
        </Card>
      </div>

      {/* Workout Plan Display */}
      {workoutPlan && (
        <div className="space-y-6">
          {/* Plan Overview */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Dumbbell className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {workoutPlan.duration}-Day {workoutPlan.type === 'home' ? 'Home' : 'Gym'} Program
                  </h2>
                  <p className="text-gray-600">
                    Personalized for your {user.fitness_goal?.replace('_', ' ')} goal
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Exercises</p>
                <p className="text-2xl font-bold text-blue-600">{workoutPlan.exercises.length}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <Target className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Focus</p>
                  <p className="font-semibold capitalize">{user.fitness_goal?.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Est. Time</p>
                  <p className="font-semibold">45-60 min/day</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-purple-600 rounded-full mr-2"></div>
                <div>
                  <p className="text-sm text-gray-600">Difficulty</p>
                  <p className="font-semibold">Intermediate</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Exercise List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workoutPlan.exercises.map((exercise, index) => (
              <Card key={index} hover className="h-fit">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{exercise.name}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Day {(index % workoutPlan.duration) + 1}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{exercise.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Sets × Reps</p>
                    <p className="font-semibold">{exercise.sets} × {exercise.reps}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Rest Time</p>
                    <p className="font-semibold">{exercise.rest_time}</p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1">Target Muscles:</p>
                  <div className="flex flex-wrap gap-1">
                    {exercise.muscle_groups.map((muscle, idx) => (
                      <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full capitalize">
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>
                
                {exercise.calories_burned && (
                  <div className="flex items-center text-sm text-orange-600">
                    <div className="w-4 h-4 bg-orange-600 rounded-full mr-2"></div>
                    <span>~{exercise.calories_burned} calories burned</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}