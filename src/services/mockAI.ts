import type { User, DietPlan, WorkoutPlan, Exercise, MealPlan, MotivationalTip } from '../types';

// Mock AI Diet Plan Generator
export function generateDietPlan(user: User): DietPlan {
  const targetCalories = calculateTargetCalories(user);
  
  const breakfast = generateMeal('breakfast', targetCalories * 0.25, user);
  const lunch = generateMeal('lunch', targetCalories * 0.35, user);
  const dinner = generateMeal('dinner', targetCalories * 0.3, user);
  const snacks = [generateMeal('snack', targetCalories * 0.1, user)];

  return {
    id: Date.now().toString(),
    user_id: user.id,
    date: new Date().toISOString(),
    breakfast,
    lunch,
    dinner,
    snacks,
    total_calories: targetCalories,
    created_at: new Date().toISOString(),
  };
}

// Mock AI Workout Plan Generator
export function generateWorkoutPlan(user: User, type: 'home' | 'gym', duration: 3 | 5 | 7): WorkoutPlan {
  const exercises = generateExercises(user, type, duration);
  
  return {
    id: Date.now().toString(),
    user_id: user.id,
    type,
    duration,
    exercises,
    created_at: new Date().toISOString(),
  };
}

// Mock AI Motivational Tips
export function generateMotivationalTip(user: User): MotivationalTip {
  const tips = [
    {
      fitness: [
        `${user.name || 'You'}, every workout brings you closer to your ${user.fitness_goal?.replace('_', ' ')} goal!`,
        'Progress, not perfection. Every rep counts!',
        'Your body can do it. It\'s time to convince your mind.',
        'The only bad workout is the one that didn\'t happen.',
        'Strength doesn\'t come from what you can do. It comes from overcoming the things you thought you couldn\'t.',
      ],
      nutrition: [
        'Fuel your body with the nutrients it craves, not just what it wants.',
        'Healthy eating is a way of life, not a temporary fix.',
        'Every meal is a chance to nourish your body and support your goals.',
        'Listen to your body - it knows what it needs.',
        'Small changes in your diet can lead to big changes in your life.',
      ],
      mindset: [
        'Believe in yourself and all that you are. You are stronger than you think!',
        'Success is the sum of small efforts repeated day in and day out.',
        'Your journey is unique. Don\'t compare your chapter 1 to someone else\'s chapter 20.',
        'Consistency is key. Small daily improvements lead to staggering yearly results.',
        'The difference between try and triumph is just a little umph!',
      ]
    }
  ];

  const types = ['fitness', 'nutrition', 'mindset'] as const;
  const randomType = types[Math.floor(Math.random() * types.length)];
  const tipArray = tips[0][randomType];
  const randomTip = tipArray[Math.floor(Math.random() * tipArray.length)];

  return {
    id: Date.now().toString(),
    content: randomTip,
    type: randomType,
    created_at: new Date().toISOString(),
  };
}

// Helper Functions
function calculateTargetCalories(user: User): number {
  if (!user.weight || !user.height || !user.age) return 2000;
  
  let bmr;
  if (user.gender === 'male') {
    bmr = 88.362 + (13.397 * user.weight) + (4.799 * user.height) - (5.677 * user.age);
  } else {
    bmr = 447.593 + (9.247 * user.weight) + (3.098 * user.height) - (4.330 * user.age);
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };

  const multiplier = activityMultipliers[user.activity_level || 'moderate'];
  let targetCalories = bmr * multiplier;

  if (user.fitness_goal === 'weight_loss') {
    targetCalories -= 300;
  } else if (user.fitness_goal === 'muscle_gain') {
    targetCalories += 300;
  }

  return Math.round(targetCalories);
}

function generateMeal(type: string, targetCalories: number, user: User): MealPlan {
  const meals = {
    breakfast: [
      {
        name: 'Protein Packed Oatmeal Bowl',
        base_calories: 350,
        protein: 20,
        carbs: 45,
        fat: 8,
        ingredients: ['Rolled oats', 'Greek yogurt', 'Banana', 'Berries', 'Almonds', 'Honey'],
        instructions: 'Cook oats with water, top with Greek yogurt, sliced banana, berries, and chopped almonds. Drizzle with honey.',
        alternatives: ['Quinoa breakfast bowl', 'Chia pudding with fruits', 'Protein smoothie bowl'],
      },
      {
        name: 'Veggie Scrambled Eggs',
        base_calories: 280,
        protein: 18,
        carbs: 12,
        fat: 16,
        ingredients: ['Eggs', 'Spinach', 'Tomatoes', 'Bell peppers', 'Cheese', 'Olive oil'],
        instructions: 'Scramble eggs with sautéed vegetables and a sprinkle of cheese.',
        alternatives: ['Veggie omelet', 'Breakfast burrito', 'Avocado toast with egg'],
      },
    ],
    lunch: [
      {
        name: 'Grilled Chicken Salad Bowl',
        base_calories: 450,
        protein: 35,
        carbs: 25,
        fat: 22,
        ingredients: ['Chicken breast', 'Mixed greens', 'Quinoa', 'Avocado', 'Cherry tomatoes', 'Olive oil dressing'],
        instructions: 'Grill chicken breast, serve over mixed greens with quinoa, avocado, and tomatoes.',
        alternatives: ['Salmon quinoa bowl', 'Turkey and hummus wrap', 'Mediterranean bowl'],
      },
      {
        name: 'Lentil Power Bowl',
        base_calories: 420,
        protein: 18,
        carbs: 55,
        fat: 12,
        ingredients: ['Red lentils', 'Sweet potato', 'Kale', 'Tahini', 'Pumpkin seeds', 'Lemon'],
        instructions: 'Cook lentils and roasted sweet potato, serve with massaged kale and tahini dressing.',
        alternatives: ['Chickpea curry bowl', 'Black bean burrito bowl', 'Tofu stir-fry bowl'],
      },
    ],
    dinner: [
      {
        name: 'Baked Salmon with Vegetables',
        base_calories: 520,
        protein: 40,
        carbs: 30,
        fat: 25,
        ingredients: ['Salmon fillet', 'Broccoli', 'Sweet potato', 'Asparagus', 'Lemon', 'Herbs'],
        instructions: 'Bake salmon with roasted vegetables, season with lemon and herbs.',
        alternatives: ['Grilled chicken with quinoa', 'Turkey meatballs with zucchini noodles', 'Baked cod with rice'],
      },
      {
        name: 'Lean Beef Stir-Fry',
        base_calories: 480,
        protein: 32,
        carbs: 35,
        fat: 20,
        ingredients: ['Lean beef strips', 'Brown rice', 'Mixed vegetables', 'Ginger', 'Garlic', 'Soy sauce'],
        instructions: 'Stir-fry beef with vegetables, serve over brown rice with ginger-garlic sauce.',
        alternatives: ['Tofu vegetable stir-fry', 'Chicken teriyaki bowl', 'Shrimp fried rice'],
      },
    ],
    snack: [
      {
        name: 'Greek Yogurt with Berries',
        base_calories: 150,
        protein: 12,
        carbs: 18,
        fat: 4,
        ingredients: ['Greek yogurt', 'Mixed berries', 'Granola', 'Honey'],
        instructions: 'Top Greek yogurt with berries and a small amount of granola.',
        alternatives: ['Apple with almond butter', 'Protein smoothie', 'Nuts and dried fruit'],
      },
      {
        name: 'Hummus and Veggies',
        base_calories: 120,
        protein: 5,
        carbs: 15,
        fat: 6,
        ingredients: ['Hummus', 'Cucumber', 'Carrots', 'Bell peppers', 'Cherry tomatoes'],
        instructions: 'Slice vegetables and serve with hummus for dipping.',
        alternatives: ['Cottage cheese with fruit', 'Trail mix', 'Protein bar'],
      },
    ],
  };

  const mealOptions = meals[type as keyof typeof meals] || meals.snack;
  const selectedMeal = mealOptions[Math.floor(Math.random() * mealOptions.length)];
  
  // Adjust calories based on target
  const ratio = targetCalories / selectedMeal.base_calories;
  
  return {
    name: selectedMeal.name,
    calories: Math.round(targetCalories),
    protein: Math.round(selectedMeal.protein * ratio),
    carbs: Math.round(selectedMeal.carbs * ratio),
    fat: Math.round(selectedMeal.fat * ratio),
    ingredients: selectedMeal.ingredients,
    instructions: selectedMeal.instructions,
    alternatives: selectedMeal.alternatives,
  };
}

function generateExercises(user: User, type: 'home' | 'gym', duration: number): Exercise[] {
  const homeExercises: Exercise[] = [
    {
      name: 'Push-ups',
      sets: 3,
      reps: '10-15',
      rest_time: '60 seconds',
      description: 'Classic bodyweight exercise for chest, shoulders, and triceps',
      muscle_groups: ['chest', 'shoulders', 'triceps'],
      calories_burned: 7,
    },
    {
      name: 'Bodyweight Squats',
      sets: 3,
      reps: '15-20',
      rest_time: '45 seconds',
      description: 'Lower body strength exercise targeting glutes and quads',
      muscle_groups: ['glutes', 'quadriceps', 'hamstrings'],
      calories_burned: 8,
    },
    {
      name: 'Mountain Climbers',
      sets: 3,
      reps: '30 seconds',
      rest_time: '30 seconds',
      description: 'High-intensity cardio exercise that works the entire body',
      muscle_groups: ['core', 'shoulders', 'legs'],
      calories_burned: 12,
    },
    {
      name: 'Plank',
      sets: 3,
      reps: '30-60 seconds',
      rest_time: '60 seconds',
      description: 'Isometric core strengthening exercise',
      muscle_groups: ['core', 'shoulders'],
      calories_burned: 5,
    },
    {
      name: 'Burpees',
      sets: 3,
      reps: '8-12',
      rest_time: '90 seconds',
      description: 'Full-body explosive exercise combining squat, jump, and push-up',
      muscle_groups: ['full body'],
      calories_burned: 15,
    },
    {
      name: 'Lunges',
      sets: 3,
      reps: '12 each leg',
      rest_time: '60 seconds',
      description: 'Single-leg exercise for lower body strength and balance',
      muscle_groups: ['glutes', 'quadriceps', 'hamstrings'],
      calories_burned: 6,
    },
  ];

  const gymExercises: Exercise[] = [
    {
      name: 'Bench Press',
      sets: 4,
      reps: '8-12',
      rest_time: '2-3 minutes',
      description: 'Compound chest exercise using barbell or dumbbells',
      muscle_groups: ['chest', 'shoulders', 'triceps'],
      calories_burned: 10,
    },
    {
      name: 'Deadlifts',
      sets: 4,
      reps: '6-8',
      rest_time: '3-4 minutes',
      description: 'Compound exercise targeting posterior chain muscles',
      muscle_groups: ['hamstrings', 'glutes', 'back'],
      calories_burned: 15,
    },
    {
      name: 'Squats',
      sets: 4,
      reps: '10-12',
      rest_time: '2-3 minutes',
      description: 'Compound lower body exercise with barbell',
      muscle_groups: ['quadriceps', 'glutes', 'hamstrings'],
      calories_burned: 12,
    },
    {
      name: 'Pull-ups',
      sets: 3,
      reps: '6-10',
      rest_time: '2 minutes',
      description: 'Upper body pulling exercise using body weight',
      muscle_groups: ['back', 'biceps'],
      calories_burned: 8,
    },
    {
      name: 'Overhead Press',
      sets: 3,
      reps: '8-12',
      rest_time: '2 minutes',
      description: 'Shoulder and core exercise using barbell or dumbbells',
      muscle_groups: ['shoulders', 'triceps', 'core'],
      calories_burned: 9,
    },
    {
      name: 'Barbell Rows',
      sets: 4,
      reps: '8-12',
      rest_time: '2 minutes',
      description: 'Back strengthening exercise using barbell',
      muscle_groups: ['back', 'biceps'],
      calories_burned: 8,
    },
  ];

  const exercisePool = type === 'home' ? homeExercises : gymExercises;
  const exercisesPerDay = Math.ceil(exercisePool.length / duration);
  
  // Adjust exercises based on fitness goal
  const selectedExercises = exercisePool.slice(0, exercisesPerDay * duration);
  
  return selectedExercises.map(exercise => {
    if (user.fitness_goal === 'muscle_gain') {
      return { ...exercise, sets: exercise.sets + 1, reps: exercise.reps.includes('-') ? 
        exercise.reps.split('-').map(n => parseInt(n) + 2).join('-') : exercise.reps };
    }
    if (user.fitness_goal === 'weight_loss') {
      return { ...exercise, rest_time: '45 seconds' };
    }
    return exercise;
  });
}