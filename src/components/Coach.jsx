import React, { useMemo, useRef, useState } from 'react';
import { Send } from 'lucide-react';

function generateTip({ question, totals, targetCalories }) {
  const msgs = [];
  const calGap = targetCalories - totals.food.calories + totals.burned;
  if (calGap > 120) msgs.push(`You're about ${Math.round(calGap)} kcal under target. Consider a balanced snack like Greek yogurt with berries or a handful of nuts.`);
  if (calGap < -120) msgs.push(`You're about ${Math.abs(Math.round(calGap))} kcal over target. A light walk or reducing dinner carbs can help balance it.`);
  if (totals.food.protein < 0.8 * (totals.food.protein + 1) && totals.food.protein < 100) {
    // noop, just preventing division by zero; we'll add explicit protein suggestion below
  }
  if (totals.food.protein < 80) msgs.push('Protein seems low today. Add eggs, paneer, tofu, or whey to hit your target.');
  if (totals.food.carbs > totals.food.protein * 3) msgs.push('Your carbs are quite high vs protein. Try swapping some carbs for lean protein.');
  if (msgs.length === 0) msgs.push('Great work! Keep meals colorful and hydrate well. Aim for 7–8k steps today.');

  // Simple QA patterns
  const q = question.toLowerCase();
  if (q.includes('protein')) msgs.unshift('High-protein options: eggs, Greek yogurt, chicken, paneer, tofu, legumes.');
  if (q.includes('breakfast')) msgs.unshift('Quick breakfast ideas: oats + whey, veggie omelette, Greek yogurt parfait, peanut butter toast + banana.');
  if (q.includes('fat loss') || q.includes('lose weight')) msgs.unshift('For fat loss: 300–500 kcal deficit, 1.6–2.2 g/kg protein, 8000 steps/day, resistance training 3x/week.');

  return msgs.slice(0, 2).join(' ');
}

export default function Coach({ profile, totals, targetCalories, onApplyTip }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi ${profile.name}! I'm your AI health coach. Ask me anything or tap quick tips below.` },
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  const quickActions = useMemo(() => [
    { label: 'High-protein snack', action: () => onApplyTip({ name: 'Greek Yogurt (150g)', calories: 146, protein: 15, carbs: 9, fats: 4, qty: 1 }) },
    { label: 'Add 15-min walk', action: () => setMessages(m => [...m, { role: 'assistant', content: 'Great! A 15-min brisk walk burns ~60 kcal. Log it under Workout.' }]) },
    { label: 'Hydration reminder', action: () => setMessages(m => [...m, { role: 'assistant', content: 'Sip water regularly. Aim for 2–3L today.' }]) },
  ], [onApplyTip]);

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg = { role: 'user', content: trimmed };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setTimeout(() => {
      const reply = generateTip({ question: trimmed, totals, targetCalories });
      setMessages(m => [...m, { role: 'assistant', content: reply }]);
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 400);
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <section className="rounded-xl border bg-white p-5 shadow-sm md:col-span-2">
        <h3 className="mb-3 font-semibold">AI Coach</h3>
        <div className="mb-3 h-[420px] overflow-y-auto rounded-md border bg-slate-50 p-3">
          {messages.map((m, i) => (
            <div key={i} className={`mb-2 max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.role === 'assistant' ? 'bg-white text-slate-700' : 'ml-auto bg-orange-500 text-white'}`}>{m.content}</div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask your coach..." className="flex-1 rounded-md border px-3 py-2" onKeyDown={e => { if (e.key === 'Enter') send(); }} />
          <button onClick={send} className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-3 py-2 text-white shadow hover:bg-orange-600">
            <Send className="h-4 w-4" /> Send
          </button>
        </div>
      </section>
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="mb-3 font-semibold">Quick Tips</h3>
        <div className="grid gap-2">
          {quickActions.map((q, i) => (
            <button key={i} onClick={q.action} className="rounded-md border px-3 py-2 text-left hover:bg-orange-50">{q.label}</button>
          ))}
        </div>
        <div className="mt-4 rounded-lg bg-orange-50 p-3 text-sm text-orange-700">
          Today: {Math.round(totals.food.calories)} kcal eaten, {Math.round(totals.burned)} kcal burned. Target {targetCalories} kcal.
        </div>
      </section>
    </div>
  );
}
