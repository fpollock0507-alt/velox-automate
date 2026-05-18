import { useState } from 'react';
import { callClaude, S } from '../constants.js';

const MSG_TYPES = ['Confirmation', 'Reminder (24hr)', 'Reminder (1hr)', 'Follow-up', 'Reschedule request'];
const CHANNELS = ['SMS', 'Email', 'WhatsApp'];

export default function BookingWorkflow() {
  const [bizName, setBizName] = useState('');
  const [industry, setIndustry] = useState('');
  const [service, setService] = useState('');
  const [channel, setChannel] = useState('SMS');
  const [appointments, setAppointments] = useState('');
  const [msgTypes, setMsgTypes] = useState(['Confirmation', 'Reminder (24hr)']);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [copied, setCopied] = useState({});

  const toggleType = (type) => {
    setMsgTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const generate = async () => {
    if (!appointments.trim() || !bizName) return;
    setLoading(true);
    setResults([]);

    const apptList = appointments.split('\n').filter(a => a.trim());

    try {
      const generated = await Promise.all(apptList.map(async (appt) => {
        const system = `You are writing ${channel} messages for ${bizName}, a ${industry} business in Sydney. Messages must be friendly, concise and professional. For SMS: under 160 chars. For Email: include subject line.`;

        const messages = await Promise.all(msgTypes.map(async (msgType) => {
          const prompt = `Write a ${msgType} ${channel} message for this appointment:
"${appt}"

Business: ${bizName} (${industry})
Service: ${service || 'appointment'}
Message type: ${msgType}
Channel: ${channel}

${channel === 'SMS' ? 'Keep under 160 characters. Include business name.' : 'Include a subject line. Keep body under 80 words.'}
${msgType.includes('Follow-up') ? 'Ask for feedback and encourage rebooking.' : ''}
${msgType.includes('Reschedule') ? 'Be apologetic and offer to reschedule easily.' : ''}

Return as JSON: ${channel === 'Email' ? '{"subject": "...", "body": "..."}' : '{"body": "..."}'}
Return ONLY the JSON.`;

          const text = await callClaude([{ role: 'user', content: prompt }], system, 400);
          const clean = text.replace(/```json|```/g, '').trim();
          return { type: msgType, ...JSON.parse(clean) };
        }));

        return { appointment: appt.trim(), messages };
      }));

      setResults(generated);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const copyMsg = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000);
  };

  const typeIcon = (type) => {
    if (type.includes('Confirm')) return '✅';
    if (type.includes('24hr')) return '🔔';
    if (type.includes('1hr')) return '⏰';
    if (type.includes('Follow')) return '⭐';
    if (type.includes('Reschedule')) return '📅';
    return '💬';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div style={{ background: S.surface, border: `1px solid ${S.border2}`, borderRadius: 16, padding: 24 }}>
        <p style={{ fontFamily: S.mono, fontSize: 11, color: S.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>Configure messages</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Business name</label>
            <input value={bizName} onChange={e => setBizName(e.target.value)} placeholder="e.g. Castle Hill Physio"
              style={{ width: '100%', background: S.surface2, border: `1px solid ${S.border2}`, borderRadius: 8, padding: '9px 12px', color: S.text, fontFamily: S.font, fontSize: 13, outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Industry</label>
            <input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Physiotherapy"
              style={{ width: '100%', background: S.surface2, border: `1px solid ${S.border2}`, borderRadius: 8, padding: '9px 12px', color: S.text, fontFamily: S.font, fontSize: 13, outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Service type</label>
            <input value={service} onChange={e => setService(e.target.value)} placeholder="e.g. Sports injury consult"
              style={{ width: '100%', background: S.surface2, border: `1px solid ${S.border2}`, borderRadius: 8, padding: '9px 12px', color: S.text, fontFamily: S.font, fontSize: 13, outline: 'none' }} />
          </div>
        </div>

        {/* Channel */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Message channel</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {CHANNELS.map(c => (
              <button key={c} onClick={() => setChannel(c)}
                style={{ background: channel === c ? 'rgba(52,211,153,0.15)' : S.surface2, border: `1px solid ${channel === c ? S.success : S.border2}`, borderRadius: 7, color: channel === c ? S.success : S.muted2, fontFamily: S.mono, fontSize: 11, padding: '7px 16px', cursor: 'pointer' }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Message types */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Generate these message types</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {MSG_TYPES.map(t => (
              <button key={t} onClick={() => toggleType(t)}
                style={{ background: msgTypes.includes(t) ? 'rgba(59,130,246,0.15)' : S.surface2, border: `1px solid ${msgTypes.includes(t) ? S.accent : S.border2}`, borderRadius: 7, color: msgTypes.includes(t) ? '#60a5fa' : S.muted2, fontFamily: S.mono, fontSize: 11, padding: '6px 13px', cursor: 'pointer' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Appointments (one per line)</label>
          <textarea value={appointments} onChange={e => setAppointments(e.target.value)} rows={5}
            placeholder={"Sarah Mitchell — Monday 14 July at 9am\nDave Harris — Tuesday 15 July at 2:30pm\nEmma Chen — Wednesday 16 July at 11am"}
            style={{ width: '100%', background: S.surface2, border: `1px solid ${S.border2}`, borderRadius: 8, padding: '9px 12px', color: S.text, fontFamily: S.font, fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.6 }} />
        </div>

        <button onClick={generate} disabled={loading || !appointments.trim() || !bizName || msgTypes.length === 0}
          style={{ marginTop: 14, background: 'linear-gradient(135deg,#34d399,#3b82f6)', border: 'none', borderRadius: 9, color: '#fff', fontFamily: S.font, fontWeight: 600, fontSize: 14, padding: '11px 24px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? '📅 Writing messages...' : `📅 Generate ${msgTypes.length} message type${msgTypes.length !== 1 ? 's' : ''} for ${appointments.split('\n').filter(a => a.trim()).length} appointment${appointments.split('\n').filter(a => a.trim()).length !== 1 ? 's' : ''}`}
        </button>
      </div>

      {results.map((result, ri) => (
        <div key={ri} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', background: S.surface2, borderBottom: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: S.success, boxShadow: `0 0 6px ${S.success}` }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: S.text }}>{result.appointment}</span>
          </div>
          <div style={{ padding: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
            {result.messages.map((msg, mi) => (
              <div key={mi} style={{ background: S.surface2, border: `1px solid ${S.border}`, borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{typeIcon(msg.type)}</span>
                    <span style={{ fontFamily: S.mono, fontSize: 10, color: S.muted2 }}>{msg.type}</span>
                  </div>
                  <button onClick={() => copyMsg(`${ri}-${mi}`, msg.subject ? `Subject: ${msg.subject}\n\n${msg.body}` : msg.body)}
                    style={{ background: copied[`${ri}-${mi}`] ? 'rgba(52,211,153,0.2)' : S.surface, border: `1px solid ${copied[`${ri}-${mi}`] ? 'rgba(52,211,153,0.4)' : S.border2}`, borderRadius: 5, color: copied[`${ri}-${mi}`] ? S.success : S.muted2, fontFamily: S.mono, fontSize: 10, padding: '3px 8px', cursor: 'pointer' }}>
                    {copied[`${ri}-${mi}`] ? '✓' : 'Copy'}
                  </button>
                </div>
                {msg.subject && <p style={{ fontSize: 11, fontFamily: S.mono, color: S.muted, marginBottom: 6 }}>Subject: {msg.subject}</p>}
                <p style={{ fontSize: 13, color: S.muted2, lineHeight: 1.6 }}>{msg.body}</p>
                {channel === 'SMS' && <p style={{ fontSize: 10, fontFamily: S.mono, color: msg.body.length > 160 ? S.danger : S.muted, marginTop: 8 }}>{msg.body.length}/160 chars</p>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
