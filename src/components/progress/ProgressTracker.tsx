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
    const userEntries = entries
      .filter(entry => entry.user_id === user?.uid)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setProgressEntries(userEntries);
  };

  const handleAddEntry = async () => {
    if (!user || !newWeight) return;

    setLoading(true);

    const newEntry: ProgressEntry = {
      id: Date.now().toString(),
      user_id: user.uid,
      weight: parseFloat(newWeight),
      date: new Date().toISOString(),
      notes: notes || undefined,
    };

    const existingEntries = StorageService.getItem<ProgressEntry[]>(AUTH_KEYS.PROGRESS_ENTRIES) || [];
    existingEntries.push(newEntry);
    StorageService.setItem(AUTH_KEYS.PROGRESS_ENTRIES, existingEntries);

    setProgressEntries(prev =>
      [...prev, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    );
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
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: 'rgba(156, 163, 175, 0.2)' },
        ticks: { color: '#6B7280' },
      },
      x: {
        grid: { color: 'rgba(156, 163, 175, 0.2)' },
        ticks: { color: '#6B7280' },
      },
    },
  };

  if (!user) return null;

  const trend = getWeightTrend();
  const currentWeight = progressEntries.length > 0
    ? progressEntries[progressEntries.length - 1].weight
    : user.weight || 0;

  const firstEntryWeight = progressEntries[0]?.weight || user.weight || 0;

  const goalWeight = user.fitness_goal === 'weight_loss'
    ? firstEntryWeight - 10
    : user.fitness_goal === 'muscle_gain'
      ? firstEntryWeight + 5
      : firstEntryWeight;

  const progressPercent = Math.min(
    100,
    Math.abs((currentWeight - firstEntryWeight) / (goalWeight - firstEntryWeight)) * 100
  );

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Progress Tracker</h1>
        <p className="text-gray-600">Track your fitness journey with detailed progress monitoring</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Progress Overview */}
        <div className="space-y-6 lg:col-span-1">
          {/* Current Stats */}
          <Card>
            <h3 className="mb-4 text-lg font-bold text-gray-900">Current Stats</h3>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Current Weight</p>
                <p className="text-3xl font-bold text-blue-600">{currentWeight} kg</p>
                {trend && (
                  <div className="mt-2 flex items-center justify-center">
                    {trend.direction === 'up' && <TrendingUp className="mr-1 h-4 w-4 text-red-500" />}
                    {trend.direction === 'down' && <TrendingDown className="mr-1 h-4 w-4 text-green-500" />}
                    {trend.direction === 'same' && <Minus className="mr-1 h-4 w-4 text-gray-500" />}
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
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Goal Progress</span>
                  <span className="text-sm font-semibold">
                    {Math.abs(currentWeight - goalWeight).toFixed(1)} kg to go
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-green-500 to-teal-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Add New Entry */}
          <Card>
            <h3 className="mb-4 text-lg font-bold text-gray-900">Log Progress</h3>
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
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            </div>
          </Card>
        </div>

        {/* Chart and History */}
        <div className="space-y-6 lg:col-span-2">
          {/* Weight Chart */}
          <Card>
            <h3 className="mb-6 text-lg font-bold text-gray-900">Weight Progress</h3>
            {progressEntries.length > 0 ? (
              <div className="h-80">
                <Line data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div className="flex h-80 items-center justify-center text-gray-500">
                <div className="text-center">
                  <TrendingUp className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p>Start logging your progress to see your chart</p>
                </div>
              </div>
            )}
          </Card>

          {/* Progress History */}
          <Card>
            <h3 className="mb-4 text-lg font-bold text-gray-900">Progress History</h3>
            {progressEntries.length > 0 ? (
              <div className="max-h-80 space-y-3 overflow-y-auto">
                {progressEntries.slice().reverse().map((entry, index) => {
                  const prevEntry = progressEntries[progressEntries.length - 2 - index];
                  let trendIcon = <Minus className="mr-1 h-4 w-4 text-gray-500" />;
                  let diff = 0;
                  if (prevEntry) {
                    diff = entry.weight - prevEntry.weight;
                    trendIcon = diff > 0
                      ? <TrendingUp className="mr-1 h-4 w-4 text-red-500" />
                      : diff < 0
                        ? <TrendingDown className="mr-1 h-4 w-4 text-green-500" />
                        : <Minus className="mr-1 h-4 w-4 text-gray-500" />;
                  }

                  return (
                    <div key={entry.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                      <div>
                        <p className="font-semibold">{entry.weight} kg</p>
                        <p className="text-sm text-gray-600">{format(new Date(entry.date), 'MMMM dd, yyyy')}</p>
                        {entry.notes && <p className="mt-1 text-sm italic text-gray-600">{entry.notes}</p>}
                      </div>
                      <div className="text-right">
                        {prevEntry && (
                          <div className="flex items-center">
                            {trendIcon}
                            <span className="text-sm text-gray-600">{Math.abs(diff).toFixed(1)} kg</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <TrendingUp className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p>No progress entries yet. Add your first entry to get started!</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
