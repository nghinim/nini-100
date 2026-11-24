import { cfg, queryAll, title, rt, url, sel, chk, rel, guard, fail } from '../lib/notion.js';

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  try {
    const { token, dbContent } = cfg();
    const rows = await queryAll(dbContent, token);
    const out = rows
      .map(p => {
        const P = p.properties;
        return {
          id: p.id,
          ten: title(P['Content project']) || 'Chưa đặt tên',
          quanId: rel(P['Quán nguồn'])[0] || null,
          raw: rt(P['Raw Note – Final']),
          long: rt(P['Long Version – Final']),
          ig: rt(P['Short Version – Final']),
          fanpage: rt(P['Fanpage – Final']),
          gmap: rt(P['Google Map Version – Final']),
          substack: url(P['Substack Draft URL']),
          canva: url(P['Canva']),
          drive: url(P['Drive']),
          status: sel(P['Status']),
          posted: chk(P['13 Đăng Blog']),
          photos: chk(P['02 Edit hình món']),
          url: p.url,
        };
      })
      // bỏ mấy row rác chưa đặt tên
      .filter(r => r.ten && r.ten !== 'New Toggle' && r.ten !== 'Untitled' && r.ten !== 'Chưa đặt tên');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ projects: out });
  } catch (e) { fail(res, e); }
}
