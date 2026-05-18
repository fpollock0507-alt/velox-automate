import { useState } from 'react';
import { callClaude, S } from '../constants.js';

export default function EmailWorkflow() {
  const [bizName, setBizName] = useState('');
  const [industry, setIndustry] = useState('');
  const [service, setService] = useState('');
  const [leads, setLeads] = useState('');
  const [days, setDays] = useState('5');
  const [loading, setLoading] = useState(false);
  const [sequences, setSequences] = useState([]);
  const [copied, setCopied] = useState({});

  const generate = async () => {
    if (!bizName || !leads.trim()) return;
    setLoading(true);
    setSequences([]);

    const leadList = leads.split('\n').filter(l => l.trim()).slice(0, 10);

    try {
      const results = await Promise.all(leadList.map(async (lead) => {
        const system = `You are an expert email copywriter for ${bizName}, a ${industry} business. Write concise, personable, non-salesy emails. Each email should feel like it's from a real human.`;

        const prompt = `Write a ${days}-email follow-up sequence for this lead: "${lead}"

Business: ${bizName}
Industry: ${industry}
Service/offer: ${service || 'AI chatbot and automation services'}

Each email should:
- Have a subject line
- Be under 100 words
- Build naturally on the previous one
- Progress: Day 1 = intro, Day 3 = value, Day 5 = social proof, Day 7 = final (if applicable)

Return as JSON array:
[{"day": 1, "subject": "...", "body": "..."}, ...]

Return ONLY the JSON array, no other text.`;

        const text = await callClaude([{ role: 'user', content: prompt }], system, 2000);
        const clean = text.replace(/```json|```/g, '').trim();
        const emails = JSON.parse(clean);
        return { lead: lead.trim(), emails };
      }));

      setSequences(results);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const copyEmail = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Config */}
      <div style={{ background: S.surface, border: `1px solid ${S.border2}`, borderRadius: 16, padding: 24 }}>
        <p style={{ fontFamily: S.mono, fontSize: 11, color: S.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>Configure sequence</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>Business name</label>
            <input value={bizName} onChange={e => setBizName(e.target.value)} placeholder="e.g. Sydney Plumbing Co"
              style={{ width: '100%', background: S.surface2, border: `1px solid ${S.border2}`, borderRadius: 8, padding: '9px 12px', color: S.text, fontFamily: S.font, fontSize: 13, outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>Industry</label>
            <input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Plumbing, Physiotherapy"
              style={{ width: '100%', background: S.surface2, border: `1px solid ${S.border2}`, borderRadius: 8, padding: '9px 12px', color: S.text, fontFamily: S.font, fontSize: 13, outline: 'none' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>What you're offering</label>
            <input value={service} onChange={e => setService(e.target.value)} placeholder="e.g. AI chatbot to capture leads 24/7"
              style={{ width: '100%', background: S.surface2, border: `1px solid ${S.border2}`, borderRadius: 8, padding: '9px 12px', color: S.text, fontFamily: S.font, fontSize: 13, outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>Sequence length</label>
            <select value={days} onChange={e => setDays(e.target.value)}
              style={{ width: '100%', background: S.surface2, border: `1px solid ${S.border2}`, borderRadius: 8, padding: '9px 12px', color: S.text, fontFamily: S.font, fontSize: 13, outline: 'none', cursor: 'pointer' }}>
              <option value="3">3 emails</option>
              <option value="5">5 emails</option>
              <option value="7">7 emails</option>
            </select>
          </div>
        </div>
        <div>
          <label style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>Lead list (one per line — name, email or company)</label>
          <textarea value={leads} onChange={e => setLeads(e.target.value)}
            placeholder={"Sarah Mitchell — Bondi Physio\nDave Harris — Castle Hill Plumbing\nEmma Chen — Newtown Espresso"}
            rows={4}
            style={{ width: '100%', background: S.surface2, border: `1px solid ${S.border2}`, borderRadius: 8, padding: '9px 12px', color: S.text, fontFamily: S.font, fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.6 }} />
        </div>
        <button onClick={generate} disabled={loading || !bizName || !leads.trim()}
          style={{ marginTop: 14, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', border: 'none', borderRadius: 9, color: '#fff', fontFamily: S.font, fontWeight: 600, fontSize: 14, padding: '11px 24px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, transition: 'all 0.2s' }}>
          {loading ? '✨ Writing sequences...' : `✉️ Generate ${days}-email sequences`}
        </button>
      </div>

      {/* Results */}
      {sequences.map((seq, si) => (
        <div key={si} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: `1px solid ${S.border}`, background: S.surface2, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 6px #3b82f6' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: S.text }}>{seq.lead}</span>
            <span style={{ fontFamily: S.mono, fontSize: 11, color: S.muted, marginLeft: 'auto' }}>{seq.emails.length} emails</span>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {seq.emails.map((email, ei) => (
              <div key={ei} style={{ background: S.surface2, border: `1px solid ${S.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: S.mono, fontSize: 10, background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 5, padding: '2px 8px' }}>Day {email.day}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: S.text }}>{email.subject}</span>
                  </div>
                  <button onClick={() => copyEmail(`${si}-${ei}`, `Subject: ${email.subject}\n\n${email.body}`)}
                    style={{ background: copied[`${si}-${ei}`] ? 'rgba(52,211,153,0.2)' : S.surface, border: `1px solid ${copied[`${si}-${ei}`] ? 'rgba(52,211,153,0.4)' : S.border2}`, borderRadius: 6, color: copied[`${si}-${ei}`] ? S.success : S.muted2, fontFamily: S.mono, fontSize: 11, padding: '3px 9px', cursor: 'pointer' }}>
                    {copied[`${si}-${ei}`] ? '✓' : 'Copy'}
                  </button>
                </div>
                <p style={{ fontSize: 13, color: S.muted2, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{email.body}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
