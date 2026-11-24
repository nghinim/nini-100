import { cfg, notion, guard, fail } from '../lib/notion.js';

// Tạo một row content mới trong Content Working, nối về quán
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Chỉ nhận POST' });
  if (!guard(req, res)) return;
  try {
    const { token, dbContent } = cfg();
    const { quanId, ten } = req.body || {};
    if (!ten) return res.status(400).json({ error: 'Thiếu tên quán' });

    const page = await notion('/pages', {
      method: 'POST', token,
      body: {
        parent: { database_id: dbContent },
        properties: {
          'Content project': { title: [{ type: 'text', text: { content: String(ten).slice(0, 1900) } }] },
          ...(quanId ? { 'Quán nguồn': { relation: [{ id: quanId }] } } : {}),
          'Tuần bắt đầu': { date: { start: monday() } },
        },
      },
    });
    res.status(200).json({ ok: true, id: page.id, url: page.url });
  } catch (e) { fail(res, e); }
}

// thứ Hai của tuần này, cho cột Tuần bắt đầu luôn neo cùng một ngày
function monday() {
  const d = new Date();
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}
