export const PROXY_URL = 'https://velox-proxy.veloxai-account.workers.dev';

export const callClaude = async (messages, system, maxTokens = 1500) => {
  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'API error');
  return data.content[0].text;
};

export const WORKFLOWS = [
  {
    id: 'email',
    name: 'Email Sequences',
    icon: '✉️',
    desc: 'AI writes and schedules multi-step follow-up email sequences for any lead list',
    color: '#3b82f6',
    tag: 'blue',
  },
  {
    id: 'leads',
    name: 'Lead Capture & CRM',
    icon: '🎯',
    desc: 'Incoming leads auto-qualified by AI, summarised and logged with action notes',
    color: '#8b5cf6',
    tag: 'purple',
  },
  {
    id: 'social',
    name: 'Social Content',
    icon: '📱',
    desc: 'Generate a week of on-brand social posts for any business in seconds',
    color: '#06b6d4',
    tag: 'cyan',
  },
  {
    id: 'booking',
    name: 'Booking & Reminders',
    icon: '📅',
    desc: 'AI generates confirmation, reminder and follow-up messages for appointments',
    color: '#34d399',
    tag: 'green',
  },
];

export const S = {
  bg: '#060810', bg2: '#0c1020', surface: '#111827', surface2: '#1a2035',
  border: 'rgba(99,179,255,0.1)', border2: 'rgba(99,179,255,0.2)',
  accent: '#3b82f6', accent2: '#8b5cf6',
  text: '#f0f4ff', muted: '#7e8fb0', muted2: '#a8b4cc',
  success: '#34d399', warn: '#fbbf24', danger: '#f87171',
  font: "'Space Grotesk', sans-serif", mono: "'JetBrains Mono', monospace",
};
