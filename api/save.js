import { cfg, notion, toRichText, toUrl, guard, fail } from '../lib/notion.js';

// map tên field trong app -> tên property trong Notion
const TEXT = {
  raw: 'Raw Note – Final',
  long: 'Long Version – Final',
  ig: 'Short Version – Final',
  fanpage: 'Fanpage – Final',
  gmap: 'Google Map Version – Final',
};
const URLS = { substack: 'Substack Draft URL', canva: 'Canva', drive: 'Drive' };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Chỉ nhận POST' });
  if (!guard(req, res)) return;
  try {
    const { token } = cfg();
    const { pageId, fields = {} } = req.body || {};
    if (!pageId) return res.status(400).json({ error: 'Thiếu pageId' });

    const props = {};
    for (const k in TEXT) if (k in fields) props[TEXT[k]] = { rich_text: toRichText(fields[k]) };
    for (const k in URLS) if (k in fields) props[URLS[k]] = { url: toUrl(fields[k]) };

    if ('posted' in fields) {
      props['13 Đăng Blog'] = { checkbox: !!fields.posted };
      props['Status'] = { select: fields.posted ? { name: 'Drafted' } : null };
    }
    if ('photos' in fields) props['02 Edit hình món'] = { checkbox: !!fields.photos };

    // mấy ô checkbox cũ tự tick theo nội dung, khỏi tick tay
    if ('raw' in fields) props['06 Viết raw note'] = { checkbox: !!String(fields.raw || '').trim() };
    if ('long' in fields) props['07 Viết long version'] = { checkbox: !!String(fields.long || '').trim() };
    if ('ig' in fields) props['08 Viết short version'] = { checkbox: !!String(fields.ig || '').trim() };
    if ('gmap' in fields) props['10 Viết Google Maps'] = { checkbox: !!String(fields.gmap || '').trim() };

    if (!Object.keys(props).length) return res.status(400).json({ error: 'Không có gì để lưu' });

    const page = await notion(`/pages/${pageId}`, { method: 'PATCH', token, body: { properties: props } });
    res.status(200).json({ ok: true, url: page.url });
  } catch (e) { fail(res, e); }
}
