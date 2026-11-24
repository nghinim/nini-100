// Gọi Notion API. Token lấy từ biến môi trường, không bao giờ nằm trong code.
const API = 'https://api.notion.com/v1';
const VER = '2022-06-28';

export function cfg() {
  const token = process.env.NOTION_TOKEN;
  const dbContent = process.env.NOTION_DB_CONTENT;
  const dbQuan = process.env.NOTION_DB_QUAN;
  if (!token) throw new Error('Thiếu NOTION_TOKEN');
  if (!dbContent) throw new Error('Thiếu NOTION_DB_CONTENT');
  if (!dbQuan) throw new Error('Thiếu NOTION_DB_QUAN');
  return { token, dbContent, dbQuan };
}

export async function notion(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': VER,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.message || res.statusText;
    const err = new Error(`Notion ${res.status}: ${msg}`);
    err.status = res.status;
    throw err;
  }
  return json;
}

// Lấy hết mọi trang trong một database (Notion trả tối đa 100 mỗi lần)
export async function queryAll(dbId, token, body = {}) {
  let cursor, out = [];
  do {
    const page = await notion(`/databases/${dbId}/query`, {
      method: 'POST', token,
      body: { page_size: 100, start_cursor: cursor, ...body },
    });
    out = out.concat(page.results);
    cursor = page.has_more ? page.next_cursor : null;
  } while (cursor);
  return out;
}

// --- đọc giá trị property ---
export const rt = p => (p?.rich_text || []).map(t => t.plain_text).join('');
export const title = p => (p?.title || []).map(t => t.plain_text).join('');
export const sel = p => p?.select?.name || '';
export const url = p => p?.url || '';
export const chk = p => !!p?.checkbox;
export const rel = p => (p?.relation || []).map(r => r.id);

// --- ghi giá trị property ---
// Notion chặn mỗi khối rich_text ở 2000 ký tự, bài dài phải cắt nhỏ ra
export function toRichText(sRaw) {
  const s = sRaw == null ? '' : String(sRaw);
  if (!s) return [];
  const chunks = [];
  for (let i = 0; i < s.length; i += 1900) chunks.push(s.slice(i, i + 1900));
  return chunks.map(c => ({ type: 'text', text: { content: c } }));
}
export const toUrl = s => (s && String(s).trim() ? String(s).trim() : null);

export function guard(req, res) {
  const want = process.env.APP_PASSCODE;
  if (!want) return true; // chưa đặt mã thì cho qua, README có cảnh báo
  const got = req.headers['x-pass'] || '';
  if (got === want) return true;
  res.status(401).json({ error: 'Sai mã mở app' });
  return false;
}

export function fail(res, e) {
  console.error(e);
  res.status(e.status === 401 ? 401 : 500).json({ error: String(e.message || e) });
}
