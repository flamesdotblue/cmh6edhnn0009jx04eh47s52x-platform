import React, { useMemo, useState } from 'react';
import { Dumbbell, Plus, Trash2 } from 'lucide-react';

const FOOD_DB = [
  { name: 'Grilled Chicken (100g)', calories: 165, protein: 31, carbs: 0, fats: 3.6 },
  { name: 'Paneer (100g)', calories: 296, protein: 23, carbs: 6, fats: 22 },
  { name: 'Boiled Egg (1)', calories: 78, protein: 6, carbs: 0.6, fats: 5.3 },
  { name: 'Banana (1)', calories: 105, protein: 1.3, carbs: 27, fats: 0.4 },
  { name: 'Oats (40g)', calories: 154, protein: 5.3, carbs: 27, fats: 2.6 },
  { name: 'Greek Yogurt (150g)', calories: 146, protein: 15, carbs: 9, fats: 4 },
  { name: 'Rice (1 cup cooked)', calories: 206, protein: 4.3, carbs: 45, fats: 0.4 },
  { name: 'Dal (1 cup)', calories: 198, protein: 12, carbs: 28, fats: 5 },
];

const WORKOUT_DB = [
  { type: 'Running', rate: 10 }, // kcal/min
  { type: 'Cycling', rate: 8 },
  { type: 'Walking', rate: 4 },
  { type: 'Yoga', rate: 3 },
  { type: 'Swimming', rate: 9 },
];

export default function FoodWorkoutLog({ date, foodList, workoutList, onAddFood, onRemoveFood, onAddWorkout, onRemoveWorkout, totals, targetCalories }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <FoodLogPanel date={date} list={foodList} onAdd={onAddFood} onRemove={onRemoveFood} />
      <WorkoutPanel date={date} list={workoutList} onAdd={onAddWorkout} onRemove={onRemoveWorkout} />
      <div className="md:col-span-2 rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="mb-2 font-semibold">Summary</h3>
        <div className="grid gap-4 sm:grid-cols-4">
          <SummaryCard label="Calories" value={`${Math.round(totals.food.calories)} / ${targetCalories}`} />
          <SummaryCard label="Protein" value={`${Math.round(totals.food.protein)} g`} />
          <SummaryCard label="Carbs" value={`${Math.round(totals.food.carbs)} g`} />
          <SummaryCard label="Fats" value={`${Math.round(totals.food.fats)} g`} />
        </div>
      </div>
    </div>
  );
}

function FoodLogPanel({ date, list, onAdd, onRemove }) {
  const [query, setQuery] = useState('');
  const [qty, setQty] = useState(1);

  const filtered = useMemo(() => {
    return FOOD_DB.filter(f => f.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6);
  }, [query]);

  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm">
      <h3 className="mb-3 font-semibold">Food Log - {date}</h3>
      <div className="mb-3 flex gap-2">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search food..." className="flex-1 rounded-md border px-3 py-2" />
        <input type="number" min={0.25} step={0.25} value={qty} onChange={e => setQty(Number(e.target.value))} className="w-24 rounded-md border px-3 py-2" />
      </div>
      <div className="mb-4 grid gap-2">
        {filtered.map((f, idx) => (
          <button key={idx} onClick={() => onAdd({ ...f, qty })} className="flex items-center justify-between rounded-md border px-3 py-2 text-left hover:bg-orange-50">
            <div>
              <div className="font-medium">{f.name}</div>
              <div className="text-xs text-slate-500">{f.calories} kcal • P {f.protein}g • C {f.carbs}g • F {f.fats}g</div>
            </div>
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <Plus className="h-4 w-4" /> Add
            </div>
          </button>
        ))}
      </div>

      <ul className="divide-y rounded-md border">
        {list.length === 0 && <li className="p-3 text-sm text-slate-500">No foods logged yet.</li>}
        {list.map((f, i) => (
          <li key={i} className="flex items-center justify-between p-3">
            <div>
              <div className="font-medium">{f.name} <span className="text-xs text-slate-500">x{f.qty}</span></div>
              <div className="text-xs text-slate-500">{Math.round(f.calories * f.qty)} kcal • P {Math.round(f.protein * f.qty)}g • C {Math.round(f.carbs * f.qty)}g • F {Math.round(f.fats * f.qty)}g</div>
            </div>
            <button onClick={() => onRemove(i)} className="rounded-md p-2 text-slate-500 hover:bg-slate-100">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function WorkoutPanel({ date, list, onAdd, onRemove }) {
  const [type, setType] = useState(WORKOUT_DB[0].type);
  const [mins, setMins] = useState(30);

  const rate = useMemo(() => WORKOUT_DB.find(w => w.type === type)?.rate || 5, [type]);
  const calories = Math.round(rate * mins);

  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm">
      <h3 className="mb-3 font-semibold">Workout Log - {date}</h3>
      <div className="mb-3 grid grid-cols-3 gap-2">
        <select value={type} onChange={e => setType(e.target.value)} className="col-span-2 rounded-md border px-3 py-2">
          {WORKOUT_DB.map(w => <option key={w.type} value={w.type}>{w.type}</option>)}
        </select>
        <input type="number" min={5} step={5} value={mins} onChange={e => setMins(Number(e.target.value))} className="rounded-md border px-3 py-2" />
      </div>
      <button onClick={() => onAdd({ type, durationMin: mins, calories })} className="mb-4 inline-flex items-center gap-2 rounded-md bg-orange-500 px-3 py-2 text-white shadow hover:bg-orange-600">
        <Dumbbell className="h-4 w-4" /> Add {type} • {calories} kcal
      </button>
      <ul className="divide-y rounded-md border">
        {list.length === 0 && <li className="p-3 text-sm text-slate-500">No workouts logged yet.</li>}
        {list.map((w, i) => (
          <li key={i} className="flex items-center justify-between p-3">
            <div>
              <div className="font-medium">{w.type} <span className="text-xs text-slate-500">{w.durationMin} min</span></div>
              <div className="text-xs text-slate-500">{w.calories} kcal</div>
            </div>
            <button onClick={() => onRemove(i)} className="rounded-md p-2 text-slate-500 hover:bg-slate-100">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
