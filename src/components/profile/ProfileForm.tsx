import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import type { User } from '../../types';

export function ProfileForm() {
  const { profile, updateProfile } = useAuth();
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    age: null,
    gender: '',
    height: null,
    weight: null,
    fitness_goal: '',
    activity_level: ''
  });

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Populate form with user profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        age: profile.age ?? null,
        gender: profile.gender || '',
        height: profile.height ?? null,
        weight: profile.weight ?? null,
        fitness_goal: profile.fitness_goal || '',
        activity_level: profile.activity_level || ''
      });
    }
  }, [profile]);

  const handleChange = (field: keyof User, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const safeData = {
        ...formData,
        age: formData.age ?? null,
        height: formData.height ?? null,
        weight: formData.weight ?? null
      };
      await updateProfile(safeData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
    }
    setLoading(false);
  };

  return (
    <Card className="mx-auto max-w-2xl p-6">
      <h2 className="mb-4 text-2xl font-bold">Complete Your Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={formData.name || ''}
          onChange={e => handleChange('name', e.target.value)}
          required
        />
        <Input
          label="Age"
          type="number"
          value={formData.age ?? ''}
          onChange={e => handleChange('age', parseInt(e.target.value))}
          min={13}
          max={120}
          required
        />
        <div>
          <label className="mb-1 block">Gender</label>
          <select
            value={formData.gender || ''}
            onChange={e => handleChange('gender', e.target.value)}
            className="w-full rounded border p-2"
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <Input
          label="Height (cm)"
          type="number"
          value={formData.height ?? ''}
          onChange={e => handleChange('height', parseInt(e.target.value))}
          min={100}
          max={250}
          required
        />
        <Input
          label="Weight (kg)"
          type="number"
          value={formData.weight ?? ''}
          onChange={e => handleChange('weight', parseInt(e.target.value))}
          min={30}
          max={300}
          required
        />
        <div>
          <label className="mb-1 block">Fitness Goal</label>
          <select
            value={formData.fitness_goal || ''}
            onChange={e => handleChange('fitness_goal', e.target.value)}
            className="w-full rounded border p-2"
            required
          >
            <option value="">Select Goal</option>
            <option value="weight_loss">Weight Loss</option>
            <option value="muscle_gain">Muscle Gain</option>
            <option value="maintenance">Maintenance</option>
            <option value="endurance">Endurance</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block">Activity Level</label>
          <select
            value={formData.activity_level || ''}
            onChange={e => handleChange('activity_level', e.target.value)}
            className="w-full rounded border p-2"
            required
          >
            <option value="">Select Activity Level</option>
            <option value="sedentary">Sedentary</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="very_active">Very Active</option>
            <option value="extra_active">Extra Active</option>
          </select>
        </div>

        {success && <p className="text-green-600">Profile updated successfully!</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </form>
    </Card>
  );
}
