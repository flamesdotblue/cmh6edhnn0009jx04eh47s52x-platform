import React, { useEffect, useMemo, useState } from 'react';
import NavBar from './components/NavBar';
import Dashboard from './components/Dashboard';
import FoodWorkoutLog from './components/FoodWorkoutLog';
import Coach from './components/Coach';

const defaultProfile = {
  name: 'Guest',
  age: 28,
  gender: 'other',
  heightCm: 170,
  weightKg: 70,
  activityLevel: 'moderate',
  goal: 'maintain', // lose | gain | maintain
  dailyProteinTarget: 120,
};

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue];
}

function App() {
  const [tab, setTab] = useState('dashboard'); // dashboard | log | coach | profile
  const [profile, setProfile] = useLocalStorage('healthify.profile', defaultProfile);
  const [foodLogs, setFoodLogs] = useLocalStorage('healthify.foodLogs', {}); // { 'YYYY-MM-DD': [ {name, calories, protein, carbs, fats, qty} ] }
  const [workoutLogs, setWorkoutLogs] = useLocalStorage('healthify.workoutLogs', {}); // { 'YYYY-MM-DD': [ {type, durationMin, calories} ] }

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const dailyFood = foodLogs[today] || [];
  const dailyWorkouts = workoutLogs[today] || [];

  const totals = useMemo(() => {
    const food = dailyFood.reduce(
      (acc, f) => {
        acc.calories += f.calories * f.qty;
        acc.protein += f.protein * f.qty;
        acc.carbs += f.carbs * f.qty;
        acc.fats += f.fats * f.qty;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
    const burned = dailyWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);
    return { food, burned };
  }, [dailyFood, dailyWorkouts]);

  const bmr = useMemo(() => {
    // Mifflin-St Jeor approximation
    const s = profile.gender === 'male' ? 5 : profile.gender === 'female' ? -161 : -78;
    return Math.round(10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + s);
  }, [profile]);

  const activityFactor = useMemo(() => {
    switch (profile.activityLevel) {
      case 'sedentary': return 1.2;
      case 'light': return 1.375;
      case 'moderate': return 1.55;
      case 'active': return 1.725;
      case 'very-active': return 1.9;
      default: return 1.55;
    }
  }, [profile.activityLevel]);

  const maintenance = Math.round(bmr * activityFactor);
  const targetCalories = useMemo(() => {
    if (profile.goal === 'lose') return maintenance - 400;
    if (profile.goal === 'gain') return maintenance + 300;
    return maintenance;
  }, [maintenance, profile.goal]);

  const last7Days = useMemo(() => {
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const f = (foodLogs[key] || []).reduce((sum, x) => sum + x.calories * x.qty, 0);
      const w = (workoutLogs[key] || []).reduce((sum, x) => sum + (x.calories || 0), 0);
      arr.push({ date: key.slice(5), consumed: f, burned: w });
    }
    return arr;
  }, [foodLogs, workoutLogs]);

  const addFood = (dateKey, foodItem) => {
    setFoodLogs(prev => {
      const day = prev[dateKey] ? [...prev[dateKey]] : [];
      day.push(foodItem);
      return { ...prev, [dateKey]: day };
    });
  };

  const removeFood = (dateKey, index) => {
    setFoodLogs(prev => {
      const day = [...(prev[dateKey] || [])];
      day.splice(index, 1);
      return { ...prev, [dateKey]: day };
    });
  };

  const addWorkout = (dateKey, workout) => {
    setWorkoutLogs(prev => {
      const day = prev[dateKey] ? [...prev[dateKey]] : [];
      day.push(workout);
      return { ...prev, [dateKey]: day };
    });
  };

  const removeWorkout = (dateKey, index) => {
    setWorkoutLogs(prev => {
      const day = [...(prev[dateKey] || [])];
      day.splice(index, 1);
      return { ...prev, [dateKey]: day };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white text-slate-800">
      <NavBar active={tab} onChange={setTab} />

      <main className="mx-auto max-w-6xl px-4 py-6">
        {tab === 'dashboard' && (
          <Dashboard
            profile={profile}
            setProfile={setProfile}
            totals={totals}
            targetCalories={targetCalories}
            maintenance={maintenance}
            last7Days={last7Days}
          />
        )}
        {tab === 'log' && (
          <FoodWorkoutLog
            date={today}
            foodList={foodLogs[today] || []}
            workoutList={workoutLogs[today] || []}
            onAddFood={item => addFood(today, item)}
            onRemoveFood={idx => removeFood(today, idx)}
            onAddWorkout={w => addWorkout(today, w)}
            onRemoveWorkout={idx => removeWorkout(today, idx)}
            totals={totals}
            targetCalories={targetCalories}
          />
        )}
        {tab === 'coach' && (
          <Coach
            profile={profile}
            totals={totals}
            targetCalories={targetCalories}
            onApplyTip={(item) => addFood(today, item)}
          />
        )}
        {tab === 'profile' && (
          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Profile</h2>
              <ProfileForm profile={profile} setProfile={setProfile} />
            </section>
            <section className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="mb-2 text-xl font-semibold">Calorie Targets</h2>
              <p className="text-sm text-slate-600 mb-4">BMR: {bmr} kcal • Maintenance: {maintenance} kcal • Target: {targetCalories} kcal</p>
              <p className="text-sm text-slate-600">Protein Target: {profile.dailyProteinTarget} g/day</p>
            </section>
          </div>
        )}
      </main>

      <footer className="py-8 text-center text-xs text-slate-500">Healthify-Lite • Local demo • Data stored in your browser</footer>
    </div>
  );
}

function ProfileForm({ profile, setProfile }) {
  return (
    <form className="grid grid-cols-2 gap-4" onSubmit={e => e.preventDefault()}>
      <label className="col-span-2 flex flex-col text-sm">Name
        <input className="mt-1 rounded-md border px-3 py-2" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
      </label>
      <label className="flex flex-col text-sm">Age
        <input type="number" className="mt-1 rounded-md border px-3 py-2" value={profile.age} onChange={e => setProfile({ ...profile, age: Number(e.target.value) })} />
      </label>
      <label className="flex flex-col text-sm">Gender
        <select className="mt-1 rounded-md border px-3 py-2" value={profile.gender} onChange={e => setProfile({ ...profile, gender: e.target.value })}>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className="flex flex-col text-sm">Height (cm)
        <input type="number" className="mt-1 rounded-md border px-3 py-2" value={profile.heightCm} onChange={e => setProfile({ ...profile, heightCm: Number(e.target.value) })} />
      </label>
      <label className="flex flex-col text-sm">Weight (kg)
        <input type="number" className="mt-1 rounded-md border px-3 py-2" value={profile.weightKg} onChange={e => setProfile({ ...profile, weightKg: Number(e.target.value) })} />
      </label>
      <label className="flex flex-col text-sm">Activity Level
        <select className="mt-1 rounded-md border px-3 py-2" value={profile.activityLevel} onChange={e => setProfile({ ...profile, activityLevel: e.target.value })}>
          <option value="sedentary">Sedentary</option>
          <option value="light">Light</option>
          <option value="moderate">Moderate</option>
          <option value="active">Active</option>
          <option value="very-active">Very Active</option>
        </select>
      </label>
      <label className="flex flex-col text-sm">Goal
        <select className="mt-1 rounded-md border px-3 py-2" value={profile.goal} onChange={e => setProfile({ ...profile, goal: e.target.value })}>
          <option value="lose">Lose</option>
          <option value="maintain">Maintain</option>
          <option value="gain">Gain</option>
        </select>
      </label>
      <label className="flex flex-col text-sm">Protein Target (g)
        <input type="number" className="mt-1 rounded-md border px-3 py-2" value={profile.dailyProteinTarget} onChange={e => setProfile({ ...profile, dailyProteinTarget: Number(e.target.value) })} />
      </label>
    </form>
  );
}

export default App;
