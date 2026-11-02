# 🚀 HƯỚNG DẪN 3 BƯỚC THIẾT LẬP CƠ SỞ DỮ LIỆU TẬP TRUNG (GOOGLE SHEETS API)
### DỰ ÁN: TỦ SÁCH SỐ 4B - TRƯỜNG TIỂU HỌC NAM ĐỒNG

Hệ thống lưu trữ sử dụng **Google Sheets** làm cơ sở dữ liệu và **Google Apps Script (GAS) Web App** làm REST API miễn phí trọn đời, hỗ trợ đọc/ghi tập trung từ mọi thiết bị (máy tính, điện thoại, máy tính bảng) trên toàn cầu.

---

### BƯỚC 1: TẠO GOOGLE SPREADSHEET MỚI
1. Truy cập [Google Drive](https://drive.google.com/) bằng tài khoản Google của bạn hoặc của lớp.
2. Bấm nút **Mới (+)** > chọn **Google Trang tính (Google Sheets)**.
3. Đặt tên cho file Google Sheet là: `CSDL Tu Sach So 4B`.

---

### BƯỚC 2: DÁN MÃ NGUỒN VÀ KHỞI TẠO DỮ LIỆU BAN ĐẦU
1. Trên thanh menu của Google Sheet, bấm vào: **Tiện ích mở rộng (Extensions)** > chọn **Apps Script**.
2. Một trình soạn thảo mã sẽ mở ra. Xóa toàn bộ nội dung mặc định trong file `Mã.gs` (hoặc `Code.gs`).
3. Mở file mã nguồn:
   ```
   D:\project-AI\ThuGau\thu-vien-sang-tao\google-apps-script\Code.gs
   ```
   Sao chép toàn bộ nội dung và dán vào trình soạn thảo Apps Script.
4. Bấm biểu tượng **Lưu (Save / Ctrl + S)**.
5. **Chuyển các truyện hiện có lên cơ sở dữ liệu mới:**
   - Trên thanh công cụ, tại menu chọn hàm (cạnh nút Gỡ lỗi/Chạy), bấm chọn hàm **`setupDatabase`**.
   - Bấm nút **Chạy (Run)**.
   - Lần đầu tiên chạy, Google sẽ yêu cầu cấp quyền: Bấm **Xem xét quyền** > chọn tài khoản Gmail của bạn > bấm **Nâng cao (Advanced)** > bấm **Đi tới dự án (không an toàn)** > bấm **Cho phép (Allow)**.
   - Sau vài giây, hệ thống tự động tạo 4 sheet: `Posts`, `Categories`, `PhysicalBooks` và `Wishes2011`, đồng thời **nạp sẵn toàn bộ truyện mẫu, danh mục thể loại, 10 sách truyện giấy và lời chúc tri ân 20/11 của Lớp 4B**.

---

### BƯỚC 3: TRIỂN KHAI THÀNH WEB APP (REST API)
1. Ở góc trên bên phải màn hình Apps Script, bấm nút **Triển khai (Deploy)** > chọn **Triển khai mới (New deployment)**.
2. Bấm vào biểu tượng bánh răng ⚙️ (Chọn loại) > chọn **Ứng dụng web (Web app)**.
3. Cấu hình chính xác như sau:
   - **Mô tả (Description):** `API Tu Sach 4B v1`
   - **Thực thi dưới dạng (Execute as):** `Tôi (email của bạn)`
   - **Ai có quyền truy cập (Who has access):** Chọn **Bất kỳ ai (Anyone)** *(Quan trọng: bắt buộc chọn "Anyone" để web trên GitHub Pages và điện thoại có thể đọc/ghi dữ liệu mà không bị chặn xác thực)*.
4. Bấm nút **Triển khai (Deploy)**.
5. Sao chép đường dẫn **URL ứng dụng web** (có định dạng kết thúc bằng `/exec`):
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

---

### BƯỚC 4: KẾT NỐI VÀO HỆ THỐNG WEBSITE
Bạn có 2 cách cực kỳ nhanh để kết nối URL trên vào website:

#### 👉 Cách 1 (Khuyên dùng - Thao tác trực tiếp trên giao diện Admin):
1. Mở trang quản trị: `D:\project-AI\ThuGau\thu-vien-sang-tao\admin.html`
2. Đăng nhập bằng tài khoản quản trị:
   - **Tài khoản:** `admin`
   - **Mật khẩu:** `admin123@@`
3. Chuyển sang Tab: **"CSDL & Cài đặt API"**.
4. Dán URL đã sao chép ở Bước 3 vào ô **Google Apps Script Web App URL** > bấm **"Lưu URL"**.
5. Bấm nút **"Kiểm tra kết nối (Ping)"** để kiểm tra (khi hiện thông báo xanh là kết nối thành công 100%).

#### 👉 Cách 2 (Gán cố định vào mã nguồn để triển khai lên GitHub Pages):
Mở file `D:\project-AI\ThuGau\thu-vien-sang-tao\config.js`, tìm dòng 8 và dán URL vào:
```javascript
const DEFAULT_API_ENDPOINT = 'https://script.google.com/macros/s/AKfycb.../exec';
```

---

### 🛡️ CẤU TRÚC BẢNG DỮ LIỆU (SCHEMA)

#### Bảng 1: `Posts` (Tác phẩm)
| Cột | Tên trường | Kiểu dữ liệu | Ý nghĩa |
| :--- | :--- | :--- | :--- |
| A | `id` | string | Mã định danh duy nhất (VD: `book-1`, `book-1730559...`) |
| B | `title` | string | Tên tác phẩm / truyện |
| C | `author` | string | Tác giả (học sinh lớp 4B sáng tác) |
| D | `category` | string | Thể loại truyện |
| E | `summary` | string | Tóm tắt ngắn nội dung |
| F | `content` | string | Toàn văn truyện / thơ |
| G | `cover` | string | URL ảnh bìa minh họa |
| H | `views` | number | Số lượt đọc |
| I | `status` | string | Trạng thái: `pending` (chờ duyệt), `approved` (đã duyệt), `rejected` (từ chối) |
| J | `createdAt` | ISO string | Thời gian gửi bài |

#### Bảng 2: `Categories` (Thể loại)
| Cột | Tên trường | Kiểu dữ liệu | Ý nghĩa |
| :--- | :--- | :--- | :--- |
| A | `id` | string | Mã thể loại |
| B | `name` | string | Tên thể loại (VD: `Truyện AI Sáng Tác`, `Thơ Ca`, ...) |
| C | `icon` | string | Biểu tượng cảm xúc hoặc emoji (VD: `✨`, `🌾`, `🚀`) |

---

### ✨ TÍNH NĂNG TỰ ĐỘNG DỰ PHÒNG (FALLBACK)
- Nếu chưa nhập API hoặc thiết bị bị mất kết nối Internet, website vẫn **tự động chuyển sang chế độ LocalStorage** với đầy đủ các truyện đã được kiểm duyệt và lưu trữ cục bộ, không bao giờ xảy ra tình trạng trang trắng hay gián đoạn trải nghiệm của học sinh và thầy cô.
