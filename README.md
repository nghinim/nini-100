# NiNi:100

App theo dõi mục tiêu 100 bài Substack trước 21/12, đọc và ghi thẳng vào hai database Notion của Nghi.

Khác với bản demo trước: bấm Lưu là nội dung đi thẳng vào Notion thật, bấm Pick là tạo row thật trong Content Working.

## Chạy được thì cần gì

Một integration Notion của riêng chị, và một project Vercel. Key không nằm trong code, chị tự cắm vào Vercel, mình không thấy giá trị key.

## Bước 1 — tạo integration Notion

Vào https://www.notion.so/my-integrations, bấm New integration, chọn Internal, đặt tên gì cũng được, ví dụ NiNi 100. Tạo xong bấm Show rồi copy cái token bắt đầu bằng `ntn_`. Giữ riêng, đừng dán vào chat hay vào code.

## Bước 2 — cho integration vô hai database

Mở trang **Content Working – Phase Flow** trong Notion, bấm dấu ba chấm góc phải trên, chọn Connections, tìm tên integration vừa tạo rồi thêm vào.

Làm y như vậy với trang **Danh sách quán hốc**.

Thiếu bước này thì app sẽ báo lỗi 404 vì integration không thấy database.

## Bước 3 — code đã nằm trên GitHub rồi

Repo: https://github.com/nghinim/nini-100, nhánh `main`. Bỏ qua bước này.

## Bước 4 — deploy Vercel

Vào https://vercel.com/new, bấm Import Git Repository, chọn `nghinim/nini-100`. Lần đầu Vercel sẽ xin quyền đọc GitHub, bấm đồng ý. Framework để Other, không cần build command.

Trước khi bấm Deploy, mở mục Environment Variables và thêm bốn biến:

| Tên | Giá trị |
|---|---|
| `NOTION_TOKEN` | token `ntn_...` ở bước 1 |
| `NOTION_DB_CONTENT` | `0c533d65705c4ab6badddd576b158ecd` |
| `NOTION_DB_QUAN` | `2f551071c1af80f3aaaacce8e02ea99b` |
| `APP_PASSCODE` | một câu mật khẩu chị tự đặt |

Bấm Deploy, chờ khoảng một phút.

`APP_PASSCODE` là lớp khoá duy nhất giữa internet và Notion của chị, vì link Vercel ai có cũng mở được. Đặt một câu dài dài, đừng để trống. Để trống là app cho mọi người ghi vào Notion của chị.

## Bước 5 — cài lên iPhone như app

Link sau khi deploy có dạng `https://nini-100.vercel.app`, tên project chị đặt sao thì link theo vậy.

Mở link đó bằng **Safari** trên iPhone, bấm nút Share, kéo xuống chọn **Add to Home Screen**. Icon bạn heo sẽ nằm ngoài màn hình chính, mở ra chạy toàn màn hình không có thanh địa chỉ, giống NiNi+.

Phải là Safari, Chrome trên iOS không cài được. Trên Mac thì Chrome bấm icon cài đặt ở thanh địa chỉ.

Mã mở app chỉ nhập một lần, app nhớ trong máy.

## Nó ghi gì vào Notion

| Trong app | Property trong Content Working |
|---|---|
| Raw note | Raw Note – Final |
| Bài Substack | Long Version – Final |
| Caption Instagram | Short Version – Final |
| Bài fanpage | Fanpage – Final |
| Review Google Maps | Google Map Version – Final |
| Link Substack | Substack Draft URL |
| Canva, Drive | Canva, Drive |
| Đánh dấu đã đăng | tick 13 Đăng Blog, Status thành Drafted |
| Đánh dấu hình xong | tick 02 Edit hình món |

Mấy ô checkbox 06, 07, 08, 10 app tự tick theo chuyện ô nội dung có chữ hay không, chị khỏi tick tay.

Bấm Pick trong Kho quán thì app tạo row mới trong Content Working, đặt tên theo tên quán, nối relation Quán nguồn, và điền Tuần bắt đầu là thứ Hai của tuần hiện tại.

## Sửa code tại máy trước khi đẩy

```bash
npm i -g vercel
vercel dev
```

Lần đầu `vercel dev` sẽ hỏi link project, xong nó kéo biến môi trường từ Vercel về. Hoặc tạo file `.env.local` theo mẫu trong `.env.example`.

## Cấu trúc

```
api/quan.js      đọc 781 quán từ Danh sách quán hốc
api/projects.js  đọc các row trong Content Working
api/save.js      ghi một hoặc nhiều field vào một row
api/pick.js      tạo row mới cho một quán
lib/notion.js    gọi Notion API, cắt bài dài thành nhiều khối 1900 ký tự
public/index.html  toàn bộ giao diện
public/manifest.webmanifest  khai báo PWA
public/icon-192.png, icon-512.png, apple-touch-icon.png  icon màn hình chính
```

Bài dài hơn 2000 ký tự vẫn lưu được vì `lib/notion.js` tự cắt ra nhiều khối, đây là giới hạn của Notion chứ không phải của app.
