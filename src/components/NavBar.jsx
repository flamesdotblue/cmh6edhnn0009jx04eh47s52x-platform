import React from 'react';
import { Home, Utensils, MessageCircle, User } from 'lucide-react';

export default function NavBar({ active, onChange }) {
  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: Home },
    { key: 'log', label: 'Log', icon: Utensils },
    { key: 'coach', label: 'Coach', icon: MessageCircle },
    { key: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-orange-500 to-rose-500" />
          <span className="font-semibold">Healthify-Lite</span>
        </div>
        <nav className="hidden gap-1 rounded-lg border bg-slate-50 p-1 md:flex">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${active === t.key ? 'bg-white shadow-sm text-orange-600' : 'text-slate-600 hover:bg-white'}`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </nav>
        <div className="md:hidden">
          <select value={active} onChange={e => onChange(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
            {tabs.map(t => (
              <option value={t.key} key={t.key}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
