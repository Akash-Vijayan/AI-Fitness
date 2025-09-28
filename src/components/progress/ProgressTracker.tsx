import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { StorageService, AUTH_KEYS } from '../../services/storage';
import type { ProgressEntry } from '../../types';
import { TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function ProgressTracker() {
  const { user } = useAuth();
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [newWeight, setNewWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProgressEntries();
    }
  }, [user]);

  const loadProgressEntries = () => {
    const entries = StorageService.getItem<ProgressEntry[]>(AUTH_KEYS.PROGRESS_ENTRIES) || [];
    const userEntries = entries.filter(entry => entry.user_id === user?.id);
    setProgressEntries(userEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const handleAddEntry = async () => {
    if (!user || !newWeight) return;
    
    setLoading(true);
    
    const newEntry: ProgressEntry = {
      id: Date.now().toString(),
      user_id: user.id,
      weight: parseFloat(newWeight),
      date: new Date().toISOString(),
      notes: notes || undefined,
    };

    const existingEntries = StorageService.getItem<ProgressEntry[]>(AUTH_KEYS.PROGRESS_ENTRIES) || [];
    existingEntries.push(newEntry);
    StorageService.setItem(AUTH_KEYS.PROGRESS_ENTRIES, existingEntries);
    
    setProgressEntries(prev => [...prev, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setNewWeight('');
    setNotes('');
    setLoading(false);
  };

  const getWeightTrend = () => {
    if (progressEntries.length < 2) return null;
    
    const latest = progressEntries[progressEntries.length - 1].weight;
    const previous = progressEntries[progressEntries.length - 2].weight;
    const diff = latest - previous;
    
    return {
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same',
      amount: Math.abs(diff),
    };
  };

  const chartData = {
    labels: progressEntries.map(entry => format(new Date(entry.date), 'MMM dd')),
    datasets: [
      {
        label: 'Weight (kg)',
        data: progressEntries.map(entry => entry.weight),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          color: '#6B7280',
        },
      },
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          color: '#6B7280',
        },
      },
    },
  };

  if (!user) return null;

  const trend = getWeightTrend();
  const currentWeight = progressEntries.length > 0 ? progressEntries[progressEntries.length - 1].weight : user.weight || 0;
  const goalWeight = user.fitness_goal === 'weight_loss' ? (user.weight || 0) - 10 : 
                    user.fitness_goal === 'muscle_gain' ? (user.weight || 0) + 5 : user.weight || 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Progress Tracker
        </h1>
        <p className="text-gray-600">Track your fitness journey with detailed progress monitoring</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Overview */}
        <div className="lg:col-span-1 space-y-6">
          {/* Current Stats */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Current Stats</h3>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Current Weight</p>
                <p className="text-3xl font-bold text-blue-600">{currentWeight} kg</p>
                {trend && (
                  <div className="flex items-center justify-center mt-2">
                    {trend.direction === 'up' && <TrendingUp className="w-4 h-4 text-red-500 mr-1" />}
                    {trend.direction === 'down' && <TrendingDown className="w-4 h-4 text-green-500 mr-1" />}
                    {trend.direction === 'same' && <Minus className="w-4 h-4 text-gray-500 mr-1" />}
                    <span className={`text-sm ${
                      trend.direction === 'up' ? 'text-red-500' : 
                      trend.direction === 'down' ? 'text-green-500' : 'text-gray-500'
                    }`}>
                      {trend.amount > 0 ? `${trend.amount.toFixed(1)} kg` : 'No change'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Goal Progress</span>
                  <span className="text-sm font-semibold">
                    {Math.abs(currentWeight - goalWeight).toFixed(1)} kg to go
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-300" 
                    style={{
                      width: `${Math.min(100, Math.abs((currentWeight - (user.weight || 0)) / (goalWeight - (user.weight || 0))) * 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Add New Entry */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Log Progress</h3>
            <div className="space-y-4">
              <Input
                label="Weight (kg)"
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="Enter your weight"
              />
              <Input
                label="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How are you feeling today?"
              />
              <Button
                onClick={handleAddEntry}
                loading={loading}
                className="w-full"
                variant="secondary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </Card>
        </div>

        {/* Chart and History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weight Chart */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Weight Progress</h3>
            {progressEntries.length > 0 ? (
              <div className="h-80">
                <Line data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Start logging your progress to see your chart</p>
                </div>
              </div>
            )}
          </Card>

          {/* Progress History */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Progress History</h3>
            {progressEntries.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {progressEntries.slice().reverse().map((entry, index) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">{entry.weight} kg</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(entry.date), 'MMMM dd, yyyy')}
                      </p>
                      {entry.notes && (
                        <p className="text-sm text-gray-600 italic mt-1">{entry.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      {index < progressEntries.length - 1 && (
                        <div className="flex items-center">
                          {entry.weight > progressEntries[progressEntries.length - 2 - index].weight ? (
                            <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                          ) : entry.weight < progressEntries[progressEntries.length - 2 - index].weight ? (
                            <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                          ) : (
                            <Minus className="w-4 h-4 text-gray-500 mr-1" />
                          )}
                          <span className="text-sm text-gray-600">
                            {Math.abs(entry.weight - progressEntries[progressEntries.length - 2 - index].weight).toFixed(1)} kg
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No progress entries yet. Add your first entry to get started!</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}