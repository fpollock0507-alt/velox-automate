import { useState } from 'react';
import { WORKFLOWS, S } from './constants.js';
import EmailWorkflow from './components/EmailWorkflow.jsx';
import LeadsWorkflow from './components/LeadsWorkflow.jsx';
import SocialWorkflow from './components/SocialWorkflow.jsx';
import BookingWorkflow from './components/BookingWorkflow.jsx';

const WORKFLOW_COMPONENTS = {
  email: EmailWorkflow,
  leads: LeadsWorkflow,
  social: SocialWorkflow,
  booking: BookingWorkflow,
};

// Sample client data stored in localStorage
const DEFAULT_CLIENTS = [
  { id: '1', name: 'Peak Physio Sydney', industry: 'Physiotherapy', status: 'active', plan: 'Pro', workflows: ['email', 'booking', 'social'], mrr: 149 },
  { id: '2', name: 'Castle Hill Plumbing', industry: 'Trades', status: 'active', plan: 'Starter', workflows: ['email', 'leads'], mrr: 99 },
  { id: '3', name: 'Newtown Espresso', industry: 'Hospitality', status: 'trial', plan: 'Trial', workflows: ['social'], mrr: 0 },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${S.bg}; color: ${S.text}; font-family: ${S.font}; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${S.border2}; border-radius: 3px; }
  body::before {
    content: '';
    position: fixed; inset: 0;
    background-image: linear-gradient(rgba(59,130,246,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59,130,246,0.025) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none; z-index: 0;
  }
  input, textarea, select {
    font-family: ${S.font};
    color: ${S.text};
  }
  input::placeholder, textarea::placeholder { color: ${S.muted}; }
  select option { background: ${S.surface2}; }
`;

export default function App() {
  const [view, setView] = useState('admin'); // 'admin' | 'client'
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('velox_automate_clients');
    return saved ? JSON.parse(saved) : DEFAULT_CLIENTS;
  });

  const saveClients = (updated) => {
    setClients(updated);
    localStorage.setItem('velox_automate_clients', JSON.stringify(updated));
  };

  const totalMRR = clients.filter(c => c.status === 'active').reduce((a, c) => a + (c.mrr || 0), 0);
  const activeClients = clients.filter(c => c.status === 'active').length;

  const WorkflowComponent = activeWorkflow ? WORKFLOW_COMPONENTS[activeWorkflow] : null;

  return (
    <>
      <style>{css}</style>

      {/* ── Nav ────────────────────────────────────────────────────────── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, padding: '14px 28px', background: 'rgba(6,8,16,0.92)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0 }}>V</div>
          <span style={{ fontWeight: 700, fontSize: 17, background: 'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Velox Automate</span>
          {activeWorkflow && (
            <>
              <span style={{ color: S.muted, fontSize: 14 }}>›</span>
              <span style={{ fontSize: 14, color: S.muted2 }}>{WORKFLOWS.find(w => w.id === activeWorkflow)?.name}</span>
            </>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {activeWorkflow && (
            <button onClick={() => setActiveWorkflow(null)}
              style={{ background: S.surface, border: `1px solid ${S.border2}`, borderRadius: 7, color: S.muted2, fontFamily: S.font, fontSize: 13, padding: '6px 13px', cursor: 'pointer' }}>
              ← Back
            </button>
          )}
          <button onClick={() => { setView('admin'); setActiveWorkflow(null); }}
            style={{ background: view === 'admin' ? 'rgba(59,130,246,0.15)' : S.surface, border: `1px solid ${view === 'admin' ? S.accent : S.border2}`, borderRadius: 7, color: view === 'admin' ? '#60a5fa' : S.muted2, fontFamily: S.font, fontSize: 13, padding: '6px 14px', cursor: 'pointer' }}>
            🔧 Admin
          </button>
          <button onClick={() => { setView('client'); setActiveWorkflow(null); }}
            style={{ background: view === 'client' ? 'rgba(52,211,153,0.12)' : S.surface, border: `1px solid ${view === 'client' ? S.success : S.border2}`, borderRadius: 7, color: view === 'client' ? S.success : S.muted2, fontFamily: S.font, fontSize: 13, padding: '6px 14px', cursor: 'pointer' }}>
            👤 Client view
          </button>
        </div>
      </nav>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 28px', position: 'relative', zIndex: 1 }}>

        {/* Active workflow */}
        {activeWorkflow && WorkflowComponent && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
                {WORKFLOWS.find(w => w.id === activeWorkflow)?.icon} {WORKFLOWS.find(w => w.id === activeWorkflow)?.name}
              </h1>
              <p style={{ fontSize: 14, color: S.muted2 }}>{WORKFLOWS.find(w => w.id === activeWorkflow)?.desc}</p>
            </div>
            <WorkflowComponent />
          </div>
        )}

        {/* Admin view */}
        {!activeWorkflow && view === 'admin' && (
          <div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
              {[
                { label: 'Active clients', val: activeClients, color: S.accent },
                { label: 'Monthly revenue', val: `$${totalMRR}`, color: S.success },
                { label: 'Trial clients', val: clients.filter(c => c.status === 'trial').length, color: S.warn },
                { label: 'Total workflows', val: clients.reduce((a, c) => a + (c.workflows?.length || 0), 0), color: S.accent2 },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12, padding: '16px 18px' }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Workflow hub */}
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontFamily: S.mono, fontSize: 11, color: S.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>// Workflow hub — run for any client</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
                {WORKFLOWS.map(wf => (
                  <button key={wf.id} onClick={() => setActiveWorkflow(wf.id)}
                    style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, padding: 22, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 10 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = wf.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.transform = 'none'; }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 11, background: `${wf.color}18`, border: `1px solid ${wf.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{wf.icon}</div>
                      <span style={{ fontSize: 15, fontWeight: 600, color: S.text }}>{wf.name}</span>
                    </div>
                    <p style={{ fontSize: 13, color: S.muted2, lineHeight: 1.6 }}>{wf.desc}</p>
                    <span style={{ fontFamily: S.mono, fontSize: 11, color: wf.color }}>Open →</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Client list */}
            <div>
              <p style={{ fontFamily: S.mono, fontSize: 11, color: S.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>// Client accounts</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {clients.map((client) => (
                  <div key={client.id} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#3b82f620,#8b5cf620)', border: `1px solid ${S.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: S.accent, flexShrink: 0 }}>
                      {client.name[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{client.name}</p>
                      <p style={{ fontSize: 12, color: S.muted2 }}>{client.industry} · {client.workflows?.length || 0} workflows active</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {client.workflows?.map(wid => (
                        <span key={wid} style={{ fontFamily: S.mono, fontSize: 9, padding: '2px 7px', borderRadius: 4, background: `${WORKFLOWS.find(w => w.id === wid)?.color}18`, color: WORKFLOWS.find(w => w.id === wid)?.color, border: `1px solid ${WORKFLOWS.find(w => w.id === wid)?.color}30` }}>
                          {WORKFLOWS.find(w => w.id === wid)?.icon}
                        </span>
                      ))}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: client.status === 'active' ? S.success : S.warn }}>{client.status === 'active' ? `$${client.mrr}/mo` : 'Trial'}</p>
                      <p style={{ fontFamily: S.mono, fontSize: 10, color: S.muted }}>{client.plan}</p>
                    </div>
                  </div>
                ))}
                <button onClick={() => {
                  const name = prompt('Client business name?');
                  if (!name) return;
                  const industry = prompt('Industry?') || 'General';
                  const newClient = { id: Date.now().toString(), name, industry, status: 'trial', plan: 'Trial', workflows: [], mrr: 0 };
                  saveClients([...clients, newClient]);
                }}
                  style={{ background: 'transparent', border: `1px dashed ${S.border2}`, borderRadius: 12, padding: '14px', color: S.muted, fontFamily: S.font, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = S.accent; e.currentTarget.style.color = S.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = S.border2; e.currentTarget.style.color = S.muted; }}>
                  + Add client
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Client view */}
        {!activeWorkflow && view === 'client' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 20, padding: '5px 14px', marginBottom: 14 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: S.success, boxShadow: `0 0 6px ${S.success}` }} />
                <span style={{ fontFamily: S.mono, fontSize: 11, color: S.success, letterSpacing: '0.06em' }}>CLIENT PORTAL</span>
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Your automation hub</h1>
              <p style={{ fontSize: 14, color: S.muted2 }}>Your AI-powered workflows — managed by Velox AI, available anytime.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
              {WORKFLOWS.map(wf => (
                <button key={wf.id} onClick={() => setActiveWorkflow(wf.id)}
                  style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, padding: 22, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 12 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = wf.color; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 30px rgba(0,0,0,0.2)`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 13, background: `${wf.color}18`, border: `1px solid ${wf.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{wf.icon}</div>
                    <span style={{ fontFamily: S.mono, fontSize: 9, padding: '3px 8px', borderRadius: 4, background: 'rgba(52,211,153,0.1)', color: S.success, border: '1px solid rgba(52,211,153,0.2)' }}>ACTIVE</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 600, color: S.text, marginBottom: 6 }}>{wf.name}</p>
                    <p style={{ fontSize: 13, color: S.muted2, lineHeight: 1.6 }}>{wf.desc}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: `1px solid ${S.border}` }}>
                    <span style={{ fontFamily: S.mono, fontSize: 11, color: S.muted }}>Click to run</span>
                    <span style={{ color: wf.color, fontSize: 16 }}>→</span>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ marginTop: 24, background: S.surface, border: `1px solid rgba(59,130,246,0.25)`, borderRadius: 14, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Managed by</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: S.text }}>Velox AI — Finlay Pollock</p>
                <p style={{ fontSize: 12, color: S.muted2, marginTop: 2 }}>finlay.veloxai@gmail.com</p>
              </div>
              <a href="mailto:finlay.veloxai@gmail.com"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', border: 'none', borderRadius: 9, color: '#fff', fontFamily: S.font, fontWeight: 600, fontSize: 13, padding: '10px 20px', cursor: 'pointer', textDecoration: 'none' }}>
                Contact your manager →
              </a>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
