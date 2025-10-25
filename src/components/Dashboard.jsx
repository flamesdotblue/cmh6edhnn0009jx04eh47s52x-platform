import React from 'react';
import { Activity, Flame, BarChart3 } from 'lucide-react';

function Donut({ value, max }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  const bg = `conic-gradient(#fb923c ${pct}%, #f1f5f9 ${pct}% 100%)`;
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative h-32 w-32 rounded-full" style={{ background: bg }}>
        <div className="absolute inset-3 rounded-full bg-white" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm text-slate-500">{pct}%</div>
            <div className="text-xs text-slate-400">of target</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sparkline({ data, height = 40 }) {
  const max = Math.max(1, ...data.map(d => d.value));
  const width = 160;
  const step = width / Math.max(1, data.length - 1);
  const points = data.map((d, i) => `${i * step},${height - (d.value / max) * height}`).join(' ');
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline fill="none" stroke="#fb923c" strokeWidth="2" points={points} />
    </svg>
  );
}

export default function Dashboard({ profile, setProfile, totals, targetCalories, maintenance, last7Days }) {
  const netCalories = Math.max(0, totals.food.calories - totals.burned);
  const proteinPct = Math.round((totals.food.protein / Math.max(1, profile.dailyProteinTarget)) * 100);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <section className="rounded-xl border bg-white p-5 shadow-sm md:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Today</h2>
          <span className="text-xs text-slate-500">Goal: {targetCalories} kcal</span>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-lg border p-4">
            <Flame className="h-8 w-8 text-orange-500" />
            <div>
              <div className="text-sm text-slate-500">Consumed</div>
              <div className="text-2xl font-semibold">{Math.round(totals.food.calories)} kcal</div>
              <div className="mt-2 h-2 w-56 rounded bg-slate-100">
                <div className="h-2 rounded bg-orange-400" style={{ width: `${Math.min(100, (totals.food.calories / targetCalories) * 100)}%` }} />
              </div>
            </div>
            <Donut value={totals.food.calories} max={targetCalories} />
          </div>
          <div className="flex items-center gap-4 rounded-lg border p-4">
            <Activity className="h-8 w-8 text-emerald-500" />
            <div>
              <div className="text-sm text-slate-500">Burned</div>
              <div className="text-2xl font-semibold">{Math.round(totals.burned)} kcal</div>
              <div className="mt-2 text-xs text-slate-500">Net: {Math.max(0, Math.round(netCalories))} kcal</div>
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <MacroCard label="Protein" value={totals.food.protein} unit="g" target={profile.dailyProteinTarget} color="bg-rose-400" />
          <MacroCard label="Carbs" value={totals.food.carbs} unit="g" color="bg-sky-400" />
          <MacroCard label="Fats" value={totals.food.fats} unit="g" color="bg-amber-400" />
        </div>
      </section>
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Weekly Trend</h3>
          <BarChart3 className="h-4 w-4 text-slate-500" />
        </div>
        <div className="space-y-3 text-sm">
          {last7Days.map((d, i) => (
            <div className="flex items-center gap-3" key={i}>
              <div className="w-12 text-slate-500">{d.date}</div>
              <div className="flex-1">
                <div className="h-2 w-full rounded bg-slate-100">
                  <div className="h-2 rounded bg-orange-400" style={{ width: `${Math.min(100, (d.consumed / Math.max(1, targetCalories)) * 100)}%` }} />
                </div>
              </div>
              <div className="w-28 text-right text-slate-600">{Math.round(d.consumed)} kcal</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center">
          <Sparkline data={last7Days.map(d => ({ value: Math.max(0, d.consumed - d.burned) }))} />
        </div>
        <div className="mt-4 rounded-lg bg-orange-50 p-3 text-xs text-orange-700">
          Maintenance: {maintenance} kcal/day
          <div className="text-slate-600">Target: {targetCalories} kcal/day</div>
          <div className="text-slate-600">Protein progress: {Math.min(100, Math.max(0, proteinPct))}%</div>
        </div>
      </section>
      <section className="rounded-xl border bg-white p-5 shadow-sm md:col-span-3">
        <h3 className="mb-3 font-semibold">Quick Profile</h3>
        <div className="grid gap-4 sm:grid-cols-5">
          <Field label="Name" value={profile.name} onChange={v => setProfile({ ...profile, name: v })} />
          <Field label="Age" type="number" value={profile.age} onChange={v => setProfile({ ...profile, age: Number(v) })} />
          <Select label="Goal" value={profile.goal} onChange={v => setProfile({ ...profile, goal: v })} options={[["lose","Lose"],["maintain","Maintain"],["gain","Gain"]]} />
          <Select label="Activity" value={profile.activityLevel} onChange={v => setProfile({ ...profile, activityLevel: v })} options={[["sedentary","Sedentary"],["light","Light"],["moderate","Moderate"],["active","Active"],["very-active","Very Active"]]} />
          <Field label="Protein Target (g)" type="number" value={profile.dailyProteinTarget} onChange={v => setProfile({ ...profile, dailyProteinTarget: Number(v) })} />
        </div>
      </section>
    </div>
  );
}

function MacroCard({ label, value, unit, target, color = 'bg-slate-400' }) {
  const pct = target ? Math.min(100, Math.round((value / target) * 100)) : null;
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-semibold">{Math.round(value)} {unit}</div>
      <div className="mt-2 h-2 w-full rounded bg-slate-100">
        <div className={`h-2 rounded ${color}`} style={{ width: `${pct ?? 100}%` }} />
      </div>
      {pct !== null && <div className="mt-1 text-right text-xs text-slate-500">{pct}%</div>}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <label className="flex flex-col text-sm">
      {label}
      <input type={type} className="mt-1 rounded-md border px-3 py-2" value={value} onChange={e => onChange(e.target.value)} />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col text-sm">
      {label}
      <select className="mt-1 rounded-md border px-3 py-2" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(([val, lab]) => <option value={val} key={val}>{lab}</option>)}
      </select>
    </label>
  );
}
