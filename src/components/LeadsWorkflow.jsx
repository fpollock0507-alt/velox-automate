import { useState } from 'react';
import { callClaude, S } from '../constants.js';

export default function LeadsWorkflow() {
  const [bizName, setBizName] = useState('');
  const [industry, setIndustry] = useState('');
  const [leadData, setLeadData] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const qualify = async () => {
    if (!leadData.trim()) return;
    setLoading(true);
    setResults([]);

    const entries = leadData.split('\n\n').filter(e => e.trim());

    try {
      const qualified = await Promise.all(entries.map(async (entry) => {
        const system = `You are a lead qualification specialist for ${bizName || 'a business'}, a ${industry || 'local'} business. You assess inbound leads and provide actionable summaries.`;

        const prompt = `Qualify this inbound lead and return a JSON object:

Lead info:
"${entry}"

Business context: ${bizName} — ${industry}

Return ONLY this JSON:
{
  "name": "lead name or Unknown",
  "contact": "email or phone if present",
  "summary": "2 sentence summary of who they are and what they want",
  "score": 1-10,
  "intent": "Hot | Warm | Cold",
  "nextAction": "specific recommended next step in one sentence",
  "flags": ["any concerns or notes as short strings"]
}`;

        const text = await callClaude([{ role: 'user', content: prompt }], system, 800);
        const clean = text.replace(/```json|```/g, '').trim();
        return { raw: entry, ...JSON.parse(clean) };
      }));

      setResults(qualified);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const intentColor = (intent) => {
    if (intent === 'Hot') return S.danger;
    if (intent === 'Warm') return S.warn;
    return S.muted;
  };

  const scoreColor = (score) => {
    if (score >= 7) return S.success;
    if (score >= 4) return S.warn;
    return S.danger;
  };

  const addToCRM = (lead) => {
    let crm = JSON.parse(localStorage.getItem('velox_crm') || '[]');
    crm.push({
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      name: lead.name || 'Unknown Lead',
      type: industry || '',
      suburb: '',
      phone: lead.contact || '',
      contact: lead.name || '',
      channel: 'inbound',
      status: lead.intent === 'Hot' ? 'replied' : 'pitched',
      value: 499,
      followUp: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0],
      notes: [{ text: `AI qualified: ${lead.summary} Next action: ${lead.nextAction}`, time: new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }) }],
      createdAt: new Date().toISOString().split('T')[0],
    });
    localStorage.setItem('velox_crm', JSON.stringify(crm));
    alert(`${lead.name} added to CRM!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div style={{ background: S.surface, border: `1px solid ${S.border2}`, borderRadius: 16, padding: 24 }}>
        <p style={{ fontFamily: S.mono, fontSize: 11, color: S.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>Qualify inbound leads</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Your business name</label>
            <input value={bizName} onChange={e => setBizName(e.target.value)} placeholder="e.g. Peak Physio Sydney"
              style={{ width: '100%', background: S.surface2, border: `1px solid ${S.border2}`, borderRadius: 8, padding: '9px 12px', color: S.text, fontFamily: S.font, fontSize: 13, outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Industry</label>
            <input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Physiotherapy"
              style={{ width: '100%', background: S.surface2, border: `1px solid ${S.border2}`, borderRadius: 8, padding: '9px 12px', color: S.text, fontFamily: S.font, fontSize: 13, outline: 'none' }} />
          </div>
        </div>
        <div>
          <label style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Paste lead info (separate multiple leads with blank line)</label>
          <textarea value={leadData} onChange={e => setLeadData(e.target.value)} rows={6}
            placeholder={"Name: Sarah Mitchell\nEmail: sarah@gmail.com\nMessage: Hi, I'm looking for physio for a sports injury. Do you have availability this week?\n\nName: John Davis\nPhone: 0412 345 678\nMessage: Need a quote for ongoing treatment after knee surgery."}
            style={{ width: '100%', background: S.surface2, border: `1px solid ${S.border2}`, borderRadius: 8, padding: '9px 12px', color: S.text, fontFamily: S.font, fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.6 }} />
        </div>
        <button onClick={qualify} disabled={loading || !leadData.trim()}
          style={{ marginTop: 14, background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)', border: 'none', borderRadius: 9, color: '#fff', fontFamily: S.font, fontWeight: 600, fontSize: 14, padding: '11px 24px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? '🎯 Qualifying leads...' : '🎯 Qualify & score leads'}
        </button>
      </div>

      {results.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
          {results.map((lead, i) => (
            <div key={i} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 600, color: S.text, marginBottom: 4 }}>{lead.name}</p>
                  <p style={{ fontSize: 12, color: S.muted2 }}>{lead.contact}</p>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontFamily: S.mono, fontSize: 11, padding: '3px 9px', borderRadius: 5, background: 'rgba(0,0,0,0.3)', color: intentColor(lead.intent), border: `1px solid ${intentColor(lead.intent)}40` }}>{lead.intent}</span>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${scoreColor(lead.score)}20`, border: `2px solid ${scoreColor(lead.score)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: scoreColor(lead.score) }}>{lead.score}</div>
                </div>
              </div>

              <p style={{ fontSize: 13, color: S.muted2, lineHeight: 1.65 }}>{lead.summary}</p>

              <div style={{ background: S.surface2, borderRadius: 9, padding: '10px 13px' }}>
                <p style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, marginBottom: 4 }}>NEXT ACTION</p>
                <p style={{ fontSize: 13, color: S.text }}>{lead.nextAction}</p>
              </div>

              {lead.flags?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {lead.flags.map((flag, fi) => (
                    <span key={fi} style={{ fontFamily: S.mono, fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(251,191,36,0.1)', color: S.warn, border: '1px solid rgba(251,191,36,0.2)' }}>{flag}</span>
                  ))}
                </div>
              )}

              <button onClick={() => addToCRM(lead)}
                style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', border: 'none', borderRadius: 8, color: '#fff', fontFamily: S.font, fontWeight: 500, fontSize: 13, padding: '9px', cursor: 'pointer' }}>
                + Add to CRM
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
