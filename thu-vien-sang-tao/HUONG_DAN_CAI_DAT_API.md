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

#### Bảng 1: `Posts` (Tác phẩm sáng tạo của học sinh)
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

#### Bảng 1.5: `Comics` (Truyện tranh dạng PDF độc lập - Lưu trữ riêng biệt)
| Cột | Tên trường | Kiểu dữ liệu | Ý nghĩa |
| :--- | :--- | :--- | :--- |
| A | `id` | string | Mã truyện tranh (VD: `comic-1730559...`) |
| B | `title` | string | Tên truyện tranh |
| C | `author` | string | Họa sĩ / Tác giả / Nguồn sưu tầm |
| D | `summary` | string | Tóm tắt ngắn nội dung truyện |
| E | `cover` | string | Link ảnh bìa truyện (Drive lh3 hoặc URL) |
| F | `pdfUrl` | string | Link xem trước file PDF toàn màn hình từ Google Drive |
| G | `views` | number | Lượt đọc của học sinh |
| H | `status` | string | Trạng thái: `approved` (hiển thị) hoặc `pending` (lưu nháp) |
| I | `createdAt` | ISO string | Ngày tải truyện lên |
*(Lưu ý: Bảng Comics không cần cột thể loại vì toàn bộ bảng đã là chuyên mục Truyện Tranh PDF)*

#### Bảng 2: `Categories` (Thể loại)
| Cột | Tên trường | Kiểu dữ liệu | Ý nghĩa |
| :--- | :--- | :--- | :--- |
| A | `id` | string | Mã thể loại |
| B | `name` | string | Tên thể loại (VD: `Truyện AI Sáng Tác`, `Thơ Ca`, ...) |
| C | `icon` | string | Biểu tượng cảm xúc hoặc emoji (VD: `✨`, `🌾`, `🚀`) |

---

### ✨ TÍNH NĂNG TỰ ĐỘNG DỰ PHÒNG (FALLBACK)
- Nếu chưa nhập API hoặc thiết bị bị mất kết nối Internet, website vẫn **tự động chuyển sang chế độ LocalStorage** với đầy đủ các truyện đã được kiểm duyệt và lưu trữ cục bộ, không bao giờ xảy ra tình trạng trang trắng hay gián đoạn trải nghiệm của học sinh và thầy cô.

---

### 🎨 TÍNH NĂNG MỚI: ĐĂNG & ĐỌC TRUYỆN TRANH DẠNG PDF
1. **Đăng truyện tranh từ máy:** Giáo viên bấm nút **"+ Đăng Truyện Tranh PDF"** tại trang Quản trị (`admin.html`). File PDF được tự động đẩy lên thư mục riêng `TuSach4B_TruyenTranhPDF` trên Google Drive.
2. **Ưu tiên tải file & linh hoạt URL:** Hệ thống ưu tiên tải tệp PDF từ máy tính, đồng thời vẫn cho phép dán link Google Drive hoặc URL tệp PDF trực tiếp. Link Google Drive được tự động chuẩn hóa sang dạng xem trước (`/preview`).
3. **Trình đọc Truyện Tranh PDF (Comic Reader) cho học sinh:** Trên trang chủ (`index.html`), truyện tranh PDF có huy hiệu nổi bật `[🎨 Truyện Tranh PDF]`, khi học sinh bấm vào sẽ mở Trình đọc truyện tranh toàn màn hình với thanh công cụ điều hướng cảm ứng, chế độ toàn màn hình và hiệu ứng tải trang sống động.
Hệ thống hiện tại đã tích hợp khả năng **tải ảnh bìa trực tiếp từ máy / điện thoại lên Google Drive** (hoàn toàn miễn phí trọn đời):
1. **Lưu trữ tự động:** File ảnh được lưu vào thư mục `TuSach4B_AnhBia` trên Google Drive của tài khoản giáo viên/lớp.
2. **Nén ảnh thông minh:** Trình duyệt tự động nén dung lượng xuống chỉ còn 150KB - 400KB trước khi gửi, giúp tải lên siêu nhanh và 15GB Google Drive có thể chứa hàng chục nghìn bức tranh.
3. **Quy tắc ưu tiên:** Giao diện hỗ trợ cả Tải ảnh từ thiết bị và Dán link URL ảnh. Nếu người dùng chọn tải ảnh thì hệ thống sẽ **ưu tiên tải ảnh lên Google Drive**; nếu không chọn ảnh thì sử dụng URL nhập vào.
4. **Cách cập nhật lại Apps Script nếu bạn đã triển khai trước đó:**
   - Mở Google Sheet > **Tiện ích mở rộng** > **Apps Script**.
   - Copy lại toàn bộ nội dung file `Code.gs` mới nhất và dán đè vào.
   - Bấm **Lưu (Ctrl + S)**.
   - Bấm **Triển khai (Deploy)** > **Quản lý bản triển khai (Manage deployments)**.
   - Bấm biểu tượng cây bút chì ✏️ (Chỉnh sửa) > tại mục **Phiên bản (Version)** chọn **Phiên bản mới (New version)** > bấm **Triển khai (Deploy)**. *(Lần đầu Google có thể hiện hộp thoại cấp quyền truy cập Drive, bạn chỉ cần bấm Cho phép (Allow))*.
