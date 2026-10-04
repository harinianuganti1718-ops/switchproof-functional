import {env, supabaseHeaders} from './_shared.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({error:'Use GET.'});
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const url = `${env('SUPABASE_URL')}/rest/v1/diagnostics?created_at=gte.${encodeURIComponent(since)}&refused=eq.false&select=id,top_skills`;
    const response = await fetch(url, {headers:{...supabaseHeaders('count=exact'), Range:'0-999'}});
    if (!response.ok) throw new Error('Stats query failed.');
    const rows = await response.json();
    const counts = new Map();
    rows.flatMap((row) => row.top_skills || []).forEach((skill) => counts.set(skill, (counts.get(skill) || 0) + 1));
    const topSkill = [...counts.entries()].sort((a,b) => b[1] - a[1])[0]?.[0] || null;
    return res.status(200).json({totalReports:rows.length, topSkill});
  } catch (error) {
    console.error(error);
    return res.status(200).json({totalReports:0, topSkill:null});
  }
}
