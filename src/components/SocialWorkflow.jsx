import { useState } from 'react';
import { callClaude, S } from '../constants.js';

const PLATFORMS = ['Instagram', 'Facebook', 'LinkedIn', 'Google Business'];
const TONES = ['Professional', 'Friendly & casual', 'Witty & fun', 'Educational', 'Motivational'];

export default function SocialWorkflow() {
  const [bizName, setBizName] = useState('');
  const [industry, setIndustry] = useState('');
  const [tone, setTone] = useState('Friendly & casual');
  const [platform, setPlatform] = useState('Instagram');
  const [topics, setTopics] = useState('');
  const [count, setCount] = useState('5');
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [copied, setCopied] = useState({});

  const generate = async () => {
    if (!bizName || !industry) return;
    setLoading(true);
    setPosts([]);

    const system = `You are a social media expert for ${bizName}, a ${industry} business in Sydney, Australia. Write ${tone.toLowerCase()} ${platform} posts that feel authentic, not corporate.`;

    const prompt = `Generate ${count} ${platform} posts for ${bizName} (${industry}).

Tone: ${tone}
Topics to cover: ${topics || 'services, tips, behind the scenes, customer results, offers'}

Each post should:
- Be optimised for ${platform}
- Include relevant emojis
- Include 3-5 hashtags at the end
- Be varied in format (tip, story, question, showcase, etc.)
- Feel like a real local Sydney business owner wrote it

Return as JSON array:
[{
  "type": "Tip | Story | Question | Showcase | Offer",
  "hook": "first line that stops the scroll",
  "body": "rest of the post",
  "hashtags": ["tag1","tag2"],
  "bestTime": "best time to post e.g. Tuesday 7pm"
}]

Return ONLY the JSON array.`;

    try {
      const text = await callClaude([{ role: 'user', content: prompt }], system, 3000);
      const clean = text.replace(/```json|```/g, '').trim();
      setPosts(JSON.parse(clean));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const copyPost = (i, post) => {
    const full = `${post.hook}\n\n${post.body}\n\n${post.hashtags.map(h => `#${h}`).join(' ')}`;
    navigator.clipboard.writeText(full);
    setCopied(prev => ({ ...prev, [i]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [i]: false })), 2000);
  };

  const typeColor = (type) => {
    const map = { Tip: '#3b82f6', Story: '#8b5cf6', Question: '#06b6d4', Showcase: '#34d399', Offer: '#f59e0b' };
    return map[type] || S.muted;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div style={{ background: S.surface, border: `1px solid ${S.border2}`, borderRadius: 16, padding: 24 }}>
        <p style={{ fontFamily: S.mono, fontSize: 11, color: S.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>Configure content</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Business name</label>
            <input value={bizName} onChange={e => setBizName(e.target.value)} placeholder="e.g. Bondi Physio"
              style={{ width: '100%', background: S.surface2, border: `1px solid ${S.border2}`, borderRadius: 8, padding: '9px 12px', color: S.text, fontFamily: S.font, fontSize: 13, outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Industry</label>
            <input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Physiotherapy"
              style={{ width: '100%', background: S.surface2, border: `1px solid ${S.border2}`, borderRadius: 8, padding: '9px 12px', color: S.text, fontFamily: S.font, fontSize: 13, outline: 'none' }} />
          </div>
        </div>

        {/* Platform selector */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Platform</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PLATFORMS.map(p => (
              <button key={p} onClick={() => setPlatform(p)}
                style={{ background: platform === p ? 'rgba(59,130,246,0.15)' : S.surface2, border: `1px solid ${platform === p ? S.accent : S.border2}`, borderRadius: 7, color: platform === p ? '#60a5fa' : S.muted2, fontFamily: S.mono, fontSize: 11, padding: '6px 14px', cursor: 'pointer' }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Tone selector */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Tone</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TONES.map(t => (
              <button key={t} onClick={() => setTone(t)}
                style={{ background: tone === t ? 'rgba(139,92,246,0.15)' : S.surface2, border: `1px solid ${tone === t ? S.accent2 : S.border2}`, borderRadius: 7, color: tone === t ? '#a78bfa' : S.muted2, fontFamily: S.mono, fontSize: 11, padding: '6px 14px', cursor: 'pointer' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Topics / themes (optional)</label>
            <input value={topics} onChange={e => setTopics(e.target.value)} placeholder="e.g. sports injury recovery, team introduction, new opening hours"
              style={{ width: '100%', background: S.surface2, border: `1px solid ${S.border2}`, borderRadius: 8, padding: '9px 12px', color: S.text, fontFamily: S.font, fontSize: 13, outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Number of posts</label>
            <select value={count} onChange={e => setCount(e.target.value)}
              style={{ width: '100%', background: S.surface2, border: `1px solid ${S.border2}`, borderRadius: 8, padding: '9px 12px', color: S.text, fontFamily: S.font, fontSize: 13, outline: 'none', cursor: 'pointer' }}>
              <option value="3">3 posts</option>
              <option value="5">5 posts (1 week)</option>
              <option value="7">7 posts</option>
              <option value="10">10 posts (2 weeks)</option>
            </select>
          </div>
        </div>

        <button onClick={generate} disabled={loading || !bizName || !industry}
          style={{ background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)', border: 'none', borderRadius: 9, color: '#fff', fontFamily: S.font, fontWeight: 600, fontSize: 14, padding: '11px 24px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? '📱 Generating posts...' : `📱 Generate ${count} ${platform} posts`}
        </button>
      </div>

      {posts.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 16 }}>
          {posts.map((post, i) => (
            <div key={i} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: S.mono, fontSize: 10, padding: '3px 9px', borderRadius: 5, background: `${typeColor(post.type)}20`, color: typeColor(post.type), border: `1px solid ${typeColor(post.type)}40` }}>{post.type}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontFamily: S.mono, fontSize: 10, color: S.muted }}>🕐 {post.bestTime}</span>
                  <button onClick={() => copyPost(i, post)}
                    style={{ background: copied[i] ? 'rgba(52,211,153,0.2)' : S.surface2, border: `1px solid ${copied[i] ? 'rgba(52,211,153,0.4)' : S.border2}`, borderRadius: 6, color: copied[i] ? S.success : S.muted2, fontFamily: S.mono, fontSize: 11, padding: '3px 9px', cursor: 'pointer' }}>
                    {copied[i] ? '✓' : 'Copy'}
                  </button>
                </div>
              </div>

              <p style={{ fontSize: 14, fontWeight: 600, color: S.text, lineHeight: 1.5 }}>{post.hook}</p>
              <p style={{ fontSize: 13, color: S.muted2, lineHeight: 1.7 }}>{post.body}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, paddingTop: 4 }}>
                {post.hashtags.map((tag, ti) => (
                  <span key={ti} style={{ fontFamily: S.mono, fontSize: 11, color: '#60a5fa' }}>#{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
