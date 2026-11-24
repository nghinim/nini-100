import { cfg, queryAll, title, sel, chk, rel, guard, fail } from '../lib/notion.js';

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  try {
    const { token, dbQuan } = cfg();
    const rows = await queryAll(dbQuan, token);
    const out = rows.map(p => {
      const P = p.properties;
      return {
        id: p.id,
        ten: title(P['Tên quán']) || 'Chưa đặt tên',
        quan: sel(P['Quận']) || '—',
        cuisine: gon(sel(P['Loại cuisine'])),
        thich: chk(P['Thích ❤️']),
        dadi: rel(P['Lần đi']).length > 0,
        contentIds: rel(P['Content đã chọn']),
        url: p.url,
      };
    }).sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json({ quan: out });
  } catch (e) { fail(res, e); }
}

// "🍜 Món Việt" -> "Việt"
function gon(s) {
  if (!s) return 'Khác';
  const map = { 'Việt': 'Việt', 'Hoa': 'Hoa', 'Nhật': 'Nhật', 'Hàn': 'Hàn', 'Thái': 'Thái', 'Âu': 'Âu', 'Ấn': 'Ấn', 'chay': 'Chay', 'Cà phê': 'Cà phê' };
  for (const k in map) if (s.includes(k)) return map[k];
  return 'Khác';
}
