import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { generateDietPlan, generateWorkoutPlan, generateMotivationalTip } from '../../services/mockAI';
import { StorageService, AUTH_KEYS } from '../../services/storage';
import type { DietPlan, WorkoutPlan, MotivationalTip } from '../../types';
import { Utensils, Dumbbell, Heart, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const { user, profile } = useAuth();
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [motivationalTip, setMotivationalTip] = useState<MotivationalTip | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
      generateDailyTip();
    }
  }, [user]);

  const loadUserData = () => {
    const dietPlans = StorageService.getItem<DietPlan[]>(AUTH_KEYS.DIET_PLANS) || [];
    const workoutPlans = StorageService.getItem<WorkoutPlan[]>(AUTH_KEYS.WORKOUT_PLANS) || [];
    
    const userDietPlan = dietPlans.find(plan => plan.user_id === user?.uid);
    const userWorkoutPlan = workoutPlans.find(plan => plan.user_id === user?.uid);
    
    setDietPlan(userDietPlan || null);
    setWorkoutPlan(userWorkoutPlan || null);
  };

  const generateDailyTip = () => {
    if (!profile) return;
    const tip = generateMotivationalTip(profile);
    setMotivationalTip(tip);
  };

  const handleGenerateDietPlan = async () => {
    if (!profile || !isProfileComplete()) return;
    
    setLoading(true);
    const newDietPlan = generateDietPlan(profile);
    
    const existingPlans = StorageService.getItem<DietPlan[]>(AUTH_KEYS.DIET_PLANS) || [];
    const filteredPlans = existingPlans.filter(plan => plan.user_id !== user?.uid);
    filteredPlans.push(newDietPlan);
    StorageService.setItem(AUTH_KEYS.DIET_PLANS, filteredPlans);
    
    setDietPlan(newDietPlan);
    setLoading(false);
  };

  const handleGenerateWorkoutPlan = async (type: 'home' | 'gym', duration: 3 | 5 | 7) => {
    if (!profile || !isProfileComplete()) return;
    
    setLoading(true);
    const newWorkoutPlan = generateWorkoutPlan(profile, type, duration);
    
    const existingPlans = StorageService.getItem<WorkoutPlan[]>(AUTH_KEYS.WORKOUT_PLANS) || [];
    const filteredPlans = existingPlans.filter(plan => plan.user_id !== user?.uid);
    filteredPlans.push(newWorkoutPlan);
    StorageService.setItem(AUTH_KEYS.WORKOUT_PLANS, filteredPlans);
    
    setWorkoutPlan(newWorkoutPlan);
    setLoading(false);
  };

  const isProfileComplete = () => {
    return !!(profile?.name && profile?.age && profile?.height && profile?.weight && profile?.fitness_goal && profile?.activity_level);
  };

  // BMI helpers
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 24.9) return 'Normal';
    if (bmi < 29.9) return 'Overweight';
    return 'Obese';
  };

  const getHealthyWeightRange = (height: number) => {
    const h = height / 100;
    const minWeight = (18.5 * h * h).toFixed(1);
    const maxWeight = (24.9 * h * h).toFixed(1);
    return `${minWeight} kg - ${maxWeight} kg`;
  };

  if (!user) return null;

  if (!isProfileComplete()) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Card className="text-center">
          <Heart className="mx-auto mb-4 h-16 w-16 text-blue-600" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Complete Your Profile</h2>
          <p className="mb-6 text-gray-600">
            To unlock personalized AI fitness plans, please complete your profile first.
          </p>
          <Button onClick={() => window.location.href = '#profile'}>
            Complete Profile
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Welcome back, {profile?.name || 'User'}! 👋
        </h1>
        <p className="text-gray-600">Your personalized AI fitness journey continues here.</p>
      </div>

      {/* Motivational Tip */}
      {motivationalTip && (
        <Card className="mb-8 border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50" hover>
          <div className="flex items-start">
            <Heart className="mr-3 mt-1 h-6 w-6 flex-shrink-0 text-blue-600" />
            <div>
              <h3 className="mb-1 font-semibold text-gray-900">Daily Motivation</h3>
              <p className="text-gray-700">{motivationalTip.content}</p>
              <span className="mt-2 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs capitalize text-blue-800">
                {motivationalTip.type}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Goal */}
        <Card className="text-center">
          <TrendingUp className="mx-auto mb-2 h-8 w-8 text-green-600" />
          <h3 className="font-semibold text-gray-900">Goal</h3>
          <p className="text-sm capitalize text-gray-600">{profile?.fitness_goal?.replace('_', ' ') || '-'}</p>
        </Card>

        {/* BMI Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-200">
            <span className="text-sm font-bold text-blue-700">BMI</span>
          </div>
          {profile?.weight && profile?.height ? (
            <>
              <h3 className="text-lg font-semibold text-gray-900">
                {(profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)}
              </h3>
              <p className="text-sm text-gray-600">{getBMICategory(profile.weight / Math.pow(profile.height / 100, 2))}</p>
              <p className="text-sm text-gray-900">
                <strong>Min:</strong> <strong>{getHealthyWeightRange(profile.height).split(' - ')[0]}</strong> &nbsp;&nbsp; 
                <strong>Max:</strong> <strong>{getHealthyWeightRange(profile.height).split(' - ')[1]}</strong>
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-600">Enter height & weight</p>
          )}
        </Card>

        {/* Activity */}
        <Card className="text-center">
          <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
            <span className="text-sm font-bold text-purple-600">ACT</span>
          </div>
          <h3 className="font-semibold capitalize text-gray-900">{profile?.activity_level?.replace('_', ' ') || '-'}</h3>
          <p className="text-sm text-gray-600">Activity Level</p>
        </Card>

        {/* Current Weight */}
        <Card className="text-center">
          <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <span className="text-sm font-bold text-green-600">W</span>
          </div>
          <h3 className="font-semibold text-gray-900">{profile?.weight || '-'} kg</h3>
          <p className="text-sm text-gray-600">Current Weight</p>
        </Card>
      </div>

      {/* AI Plans Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Diet Plan */}
        <Card className="h-fit">
          <div className="mb-4 flex items-center">
            <Utensils className="mr-2 h-6 w-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">AI Diet Plan</h2>
          </div>
          {dietPlan ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 p-4">
                <p className="mb-2 font-semibold text-green-800">Today's Target: {dietPlan.total_calories} cal</p>
                <div className="space-y-1 text-sm text-green-700">
                  <p><strong>Breakfast:</strong> {dietPlan.breakfast.name} ({dietPlan.breakfast.calories} cal)</p>
                  <p><strong>Lunch:</strong> {dietPlan.lunch.name} ({dietPlan.lunch.calories} cal)</p>
                  <p><strong>Dinner:</strong> {dietPlan.dinner.name} ({dietPlan.dinner.calories} cal)</p>
                  <p><strong>Snack:</strong> {dietPlan.snacks[0]?.name} ({dietPlan.snacks[0]?.calories} cal)</p>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={handleGenerateDietPlan} loading={loading}>
                Generate New Plan
              </Button>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="mb-4 text-gray-600">No diet plan generated yet</p>
              <Button onClick={handleGenerateDietPlan} loading={loading} variant="secondary">
                Generate AI Diet Plan
              </Button>
            </div>
          )}
        </Card>

        {/* Workout Plan */}
        <Card className="h-fit">
          <div className="mb-4 flex items-center">
            <Dumbbell className="mr-2 h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">AI Workout Plan</h2>
          </div>
          {workoutPlan ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="mb-2 font-semibold text-blue-800">{workoutPlan.duration}-Day {workoutPlan.type === 'home' ? 'Home' : 'Gym'} Program</p>
                <div className="space-y-1 text-sm text-blue-700">
                  {workoutPlan.exercises.slice(0, 4).map((exercise, index) => (
                    <p key={index}><strong>Day {index + 1}:</strong> {exercise.name} - {exercise.sets} sets × {exercise.reps}</p>
                  ))}
                  {workoutPlan.exercises.length > 4 && (
                    <p className="text-xs text-blue-600">+ {workoutPlan.exercises.length - 4} more exercises</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => handleGenerateWorkoutPlan('home', 5)} loading={loading}>
                  Home Plan
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleGenerateWorkoutPlan('gym', 5)} loading={loading}>
                  Gym Plan
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="mb-4 text-gray-600">No workout plan generated yet</p>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" onClick={() => handleGenerateWorkoutPlan('home', 5)} loading={loading}>Home Workout</Button>
                  <Button size="sm" onClick={() => handleGenerateWorkoutPlan('gym', 5)} loading={loading}>Gym Workout</Button>
                </div>
                <p className="text-xs text-gray-500">5-day plans • Customize duration later</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
