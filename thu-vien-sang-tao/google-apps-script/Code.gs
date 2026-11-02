/**
 * =========================================================================
 * BACKEND GOOGLE APPS SCRIPT CHO HỆ THỐNG TỦ SÁCH SỐ 4B
 * Trường TH Nam Đồng - Hội thi Tủ sách chia sẻ
 * =========================================================================
 * 
 * Hướng dẫn triển khai nhanh:
 * 1. Mở một Google Sheet mới trên Google Drive (đặt tên: "CSDL Tu Sach So 4B").
 * 2. Vào menu "Tiện ích mở rộng" (Extensions) > "Apps Script".
 * 3. Xóa hết mã cũ, dán toàn bộ nội dung file này vào file Code.gs.
 * 4. Trên thanh công cụ, chọn hàm "setupDatabase" và bấm nút "Chạy" (Run) để tự động tạo bảng & nạp 4 truyện mẫu.
 * 5. Bấm nút "Triển khai" (Deploy) > "Triển khai mới" (New deployment).
 *    - Loại triển khai: "Ứng dụng web" (Web app).
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me).
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone).
 * 6. Bấm "Triển khai" và sao chép Web App URL (dạng https://script.google.com/macros/s/.../exec)
 *    để dán vào trang Quản trị (admin.html) hoặc file config.js!
 */

// Tên các bảng tính
const SHEET_POSTS = 'Posts';
const SHEET_CATEGORIES = 'Categories';
const SHEET_PHYSICAL_BOOKS = 'PhysicalBooks';

// Cấu trúc cột của Sheet Posts
const POST_COLUMNS = ['id', 'title', 'author', 'category', 'summary', 'content', 'cover', 'views', 'status', 'createdAt'];

// Cấu trúc cột của Sheet Categories
const CAT_COLUMNS = ['id', 'name', 'icon'];

// Cấu trúc cột của Sheet PhysicalBooks (Sách truyện giấy & mượn trả)
const PHYSICAL_COLUMNS = ['id', 'code', 'title', 'author', 'category', 'shelf', 'status', 'borrower', 'borrowDate', 'returnDate', 'note'];

/**
 * Hàm khởi tạo cơ sở dữ liệu và nạp dữ liệu mẫu ban đầu
 * Chạy hàm này lần đầu tiên khi cài đặt!
 */
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Tạo hoặc lấy Sheet Posts
  let sheetPosts = ss.getSheetByName(SHEET_POSTS);
  if (!sheetPosts) {
    sheetPosts = ss.insertSheet(SHEET_POSTS);
  }
  sheetPosts.clear();
  sheetPosts.appendRow(POST_COLUMNS);
  sheetPosts.getRange(1, 1, 1, POST_COLUMNS.length).setFontWeight('bold').setBackground('#dbeafe');

  // 2. Tạo hoặc lấy Sheet Categories
  let sheetCats = ss.getSheetByName(SHEET_CATEGORIES);
  if (!sheetCats) {
    sheetCats = ss.insertSheet(SHEET_CATEGORIES);
  }
  sheetCats.clear();
  sheetCats.appendRow(CAT_COLUMNS);
  sheetCats.getRange(1, 1, 1, CAT_COLUMNS.length).setFontWeight('bold').setBackground('#fef3c7');

  // Xóa sheet mặc định "Sheet1" nếu có và đang có nhiều hơn 1 sheet
  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Trang tính1');
  if (defaultSheet && ss.getSheets().length > 2) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }

  // 3. Nạp danh mục thể loại mẫu
  const initialCats = [
    ['cat-1', 'Truyện AI Sáng Tác', '✨'],
    ['cat-2', 'Truyện Song Ngữ', '🌐'],
    ['cat-3', 'Thơ Ca', '🌾'],
    ['cat-4', 'STEM & Khoa Học', '🚀']
  ];
  initialCats.forEach(cat => sheetCats.appendRow(cat));

  // 4. Nạp 4 bài viết truyện mẫu ban đầu của Tủ Sách Số 4B
  const initialPosts = [
    [
      'book-1',
      'Hành Trình Khám Phá Vũ Trụ Cùng AI',
      'Chu Nam Phong (Lớp 4B)',
      'Truyện AI Sáng Tác',
      'Một câu chuyện phiêu lưu kỳ thú qua các hành tinh do em Nam Phong viết kịch bản và AI minh họa.',
      'Ngày xửa ngày xưa, ở một ngôi trường tiểu học xinh đẹp, có một cậu bé tên là Nam Phong rất thích quan sát bầu trời đêm. \n\nMột ngày nọ, Nam Phong chế tạo ra một chú robot nhỏ tên là Aki bằng công nghệ Trí tuệ Nhân tạo. Aki có thể nói chuyện và giải đáp mọi thắc mắc của Nam Phong về các vì sao.\n\nCùng nhau, Nam Phong và Aki đã thực hiện một chuyến du hành tưởng tượng xuyên qua Hệ Mặt Trời, ghé thăm Sao Hỏa đỏ rực và những vành đai rực rỡ của Sao Thổ. Qua chuyến đi, Nam Phong hiểu rằng khoa học và trí tuệ nhân tạo là người bạn đồng hành tuyệt vời giúp con người vươn tới những ước mơ cao xa.',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop',
      124,
      'approved',
      new Date('2024-11-15T08:00:00Z').toISOString()
    ],
    [
      'book-2',
      'The Little Bear & The Forest / Chú Gấu Nhỏ Và Rừng Xanh',
      'Nguyễn Kiều Anh (Lớp 4B)',
      'Truyện Song Ngữ',
      'Truyện tranh song ngữ Anh - Việt dạy bài học về việc bảo vệ môi trường và yêu thương cây xanh.',
      'Once upon a time, in a green forest, lived a little bear named Barnaby. Barnaby loved planting trees.\n(Ngày xửa ngày xưa, trong một khu rừng xanh tươi, có một chú gấu nhỏ tên là Barnaby. Barnaby rất thích trồng cây.)\n\nOne sunny morning, he found a withered flower near the stream. He carefully watered it every day.\n(Một sáng nắng đẹp, chú tìm thấy một bông hoa héo bên dòng suối. Chú cẩn thận tưới nước cho nó mỗi ngày.)\n\nLessons learned: Nature is our best friend. Protect the green planet!\n(Bài học rút ra: Thiên nhiên là người bạn tốt nhất của chúng ta. Hãy bảo vệ hành tinh xanh!)',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop',
      98,
      'approved',
      new Date('2024-11-16T09:30:00Z').toISOString()
    ],
    [
      'book-3',
      'Nắng Khai Trường & Thầy Cô Kính Yêu',
      'Nguyễn Hải An (Lớp 4B)',
      'Thơ Ca',
      'Tập thơ ngắn xúc động chào mừng Ngày Nhà giáo Việt Nam 20/11 do học sinh sáng tác.',
      'Nắng thu vàng rực khoảng sân trường\nTiếng giảng bài cô đọng yêu thương\nHàng cây xanh mát nghiêng đầu đón\nNhiệt huyết thầy gieo muôn vạn phương.\n\nChúng em ghi nhớ lời cô dạy\nChăm ngoan học tốt xứng cháu Bác Hồ\nMái trường Nam Đồng thân thương quá\nNâng bước tuổi thơ dệt ước mơ!',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop',
      215,
      'approved',
      new Date('2024-11-18T10:15:00Z').toISOString()
    ],
    [
      'book-4',
      'Bí Mật Của Nước & Sự Tuần Hoàn Kỳ Diệu',
      'Chu Thị Minh Hằng (Lớp 4B)',
      'STEM & Khoa Học',
      'Sách khám phá khoa học vui kết hợp bài tập thực nghiệm đơn giản tại lớp học.',
      'Bạn có biết giọt nước mưa rơi trên lá cây từ đâu đến không?\n\nNước sông hồ khi gặp ánh nắng mặt trời chiếu vào sẽ bốc hơi bay lên không trung. Khi lên cao gặp lạnh, hơi nước ngưng tụ lại thành những đám mây bồng bềnh.\n\nKhi các đám mây trở nên nặng trĩu, những giọt nước bé nhỏ rơi xuống tạo thành mưa. Đó chính là vòng tuần hoàn kỳ diệu của nước trong thiên nhiên mà chúng mình được học trong môn Khoa học!',
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop',
      85,
      'approved',
      new Date('2024-11-19T14:20:00Z').toISOString()
    ]
  ];

  initialPosts.forEach(post => sheetPosts.appendRow(post));

  // 5. Tạo hoặc lấy Sheet PhysicalBooks (10 sách truyện giấy mẫu)
  let sheetPhysical = ss.getSheetByName(SHEET_PHYSICAL_BOOKS);
  if (!sheetPhysical) {
    sheetPhysical = ss.insertSheet(SHEET_PHYSICAL_BOOKS);
  }
  sheetPhysical.clear();
  sheetPhysical.appendRow(PHYSICAL_COLUMNS);
  sheetPhysical.getRange(1, 1, 1, PHYSICAL_COLUMNS.length).setFontWeight('bold').setBackground('#fed7aa');

  const initialPhysical = [
    ['pb-1', 'SG-01', 'Dế Mèn Phiêu Lưu Ký', 'Tô Hoài', 'Văn học thiếu nhi', 'Kệ A1', 'borrowed', 'Trần Bảo Nam (4B)', '2024-11-18', '2024-11-25', 'Bìa cứng, giữ gìn tốt'],
    ['pb-2', 'SG-02', 'Đất Rừng Phương Nam', 'Đoàn Giỏi', 'Văn học thiếu nhi', 'Kệ A1', 'available', '', '', '', 'Sách mới'],
    ['pb-3', 'SG-03', 'Kính Vạn Hoa (Tập 1 - Nhà Ảo Thuật)', 'Nguyễn Nhật Ánh', 'Truyện dài thiếu nhi', 'Kệ A2', 'borrowed', 'Nguyễn Hoàng Long (4B)', '2024-11-20', '2024-11-27', 'Sách bìa mềm'],
    ['pb-4', 'SG-04', 'Totto-chan Bên Cửa Sổ', 'Kuroyanagi Tetsuko', 'Văn học kinh điển', 'Kệ B1', 'available', '', '', '', 'Có tranh minh họa'],
    ['pb-5', 'SG-05', 'Hoàng Tử Bé', 'Antoine de Saint-Exupéry', 'Truyện ngụ ngôn', 'Kệ B1', 'borrowed', 'Phạm Thảo Vy (4B)', '2024-11-19', '2024-11-26', 'Bản dịch mới có màu'],
    ['pb-6', 'SG-06', 'Thần Đồng Đất Việt (Tập 15 - Trí Tuệ Trạng Tí)', 'Phan Thị', 'Truyện tranh lịch sử', 'Kệ C1', 'borrowed', 'Chu Nam Phong (4B)', '2024-11-21', '2024-11-28', 'Rất được các bạn yêu thích'],
    ['pb-7', 'SG-07', 'Doraemon Tuyển Tập Truyện Dài (Tập 3)', 'Fujiko F. Fujio', 'Truyện tranh khoa học', 'Kệ C1', 'available', '', '', '', 'Có bọc nilon bảo quản'],
    ['pb-8', 'SG-08', 'Bách Khoa Tri Thức - Kỳ Quan Thiên Nhiên Thế Giới', 'Nhiều tác giả', 'Khoa học & Khám phá', 'Kệ D2', 'available', '', '', '', 'Sách khổ lớn, đọc tại lớp'],
    ['pb-9', 'SG-09', 'Những Tấm Lòng Cao Cả', 'Edmondo De Amicis', 'Giáo dục đạo đức', 'Kệ A3', 'borrowed', 'Vũ Quỳnh Mai (4B)', '2024-11-17', '2024-11-24', 'Bài học cảm động'],
    ['pb-10', 'SG-10', '10 Vạn Câu Hỏi Vì Sao - Bí Ẩn Quanh Em', 'Nhiều tác giả', 'Khoa học vui', 'Kệ D1', 'available', '', '', '', 'Sách kiến thức đời sống']
  ];
  initialPhysical.forEach(p => sheetPhysical.appendRow(p));

  Logger.log('🎉 Cấu hình cơ sở dữ liệu Tủ Sách Số 4B thành công!');
}

/**
 * Xử lý yêu cầu HTTP GET
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getPosts';
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Kiểm tra kết nối (Ping)
    if (action === 'ping') {
      return jsonResponse({ success: true, message: 'Google Sheets API Tủ Sách Số 4B đang hoạt động tốt!' });
    }

    // 2. Lấy danh sách thể loại (Categories)
    if (action === 'getCategories') {
      const sheetCats = ss.getSheetByName(SHEET_CATEGORIES);
      if (!sheetCats) {
        return jsonResponse({ success: true, data: [] });
      }
      const data = sheetCats.getDataRange().getValues();
      if (data.length <= 1) return jsonResponse({ success: true, data: [] });

      const headers = data[0];
      const categories = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[0]) continue;
        categories.push({
          id: String(row[0]),
          name: String(row[1] || ''),
          icon: String(row[2] || '📖')
        });
      }
      return jsonResponse({ success: true, data: categories });
    }

    // 3. Tăng lượt xem (Views)
    if (action === 'incrementViews') {
      const id = e.parameter.id;
      if (!id) return jsonResponse({ success: false, message: 'Thiếu id bài viết' });

      const sheetPosts = ss.getSheetByName(SHEET_POSTS);
      if (sheetPosts) {
        const data = sheetPosts.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
          if (String(data[i][0]) === String(id)) {
            const currentViews = Number(data[i][7]) || 0;
            sheetPosts.getRange(i + 1, 8).setValue(currentViews + 1);
            return jsonResponse({ success: true, views: currentViews + 1 });
          }
        }
      }
      return jsonResponse({ success: false, message: 'Không tìm thấy bài viết' });
    }

    // 4. Lấy danh sách sách truyện giấy (getPhysicalBooks)
    if (action === 'getPhysicalBooks') {
      const sheetPhysical = ss.getSheetByName(SHEET_PHYSICAL_BOOKS);
      if (!sheetPhysical) return jsonResponse({ success: true, data: [] });

      const data = sheetPhysical.getDataRange().getValues();
      if (data.length <= 1) return jsonResponse({ success: true, data: [] });

      const physicalList = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[0]) continue;
        physicalList.push({
          id: String(row[0]),
          code: String(row[1] || ''),
          title: String(row[2] || ''),
          author: String(row[3] || ''),
          category: String(row[4] || ''),
          shelf: String(row[5] || ''),
          status: String(row[6] || 'available'),
          borrower: String(row[7] || ''),
          borrowDate: row[8] ? (row[8] instanceof Date ? row[8].toISOString().split('T')[0] : String(row[8])) : '',
          returnDate: row[9] ? (row[9] instanceof Date ? row[9].toISOString().split('T')[0] : String(row[9])) : '',
          note: String(row[10] || '')
        });
      }
      return jsonResponse({ success: true, data: physicalList });
    }

    // 5. Lấy danh sách bài viết (getPosts)
    const statusFilter = (e && e.parameter && e.parameter.status) ? e.parameter.status : null;
    const sheetPosts = ss.getSheetByName(SHEET_POSTS);

    if (!sheetPosts) {
      return jsonResponse({ success: true, data: [] });
    }

    const data = sheetPosts.getDataRange().getValues();
    if (data.length <= 1) {
      return jsonResponse({ success: true, data: [] });
    }

    const posts = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue; // Bỏ qua dòng trống

      const post = {
        id: String(row[0]),
        title: String(row[1] || ''),
        author: String(row[2] || ''),
        category: String(row[3] || ''),
        summary: String(row[4] || ''),
        content: String(row[5] || ''),
        cover: String(row[6] || ''),
        views: Number(row[7]) || 0,
        status: String(row[8] || 'pending'),
        createdAt: row[9] ? (row[9] instanceof Date ? row[9].toISOString() : String(row[9])) : new Date().toISOString()
      };

      if (!statusFilter || statusFilter === 'all' || post.status === statusFilter) {
        posts.push(post);
      }
    }

    // Sắp xếp bài mới nhất lên đầu
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return jsonResponse({ success: true, data: posts });

  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

/**
 * Xử lý yêu cầu HTTP POST
 */
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Thêm bài viết mới (User gửi bài -> status: pending)
    if (action === 'createPost') {
      const post = payload.post;
      if (!post || !post.title || !post.author) {
        return jsonResponse({ success: false, message: 'Dữ liệu bài viết không hợp lệ.' });
      }

      let sheetPosts = ss.getSheetByName(SHEET_POSTS);
      if (!sheetPosts) {
        sheetPosts = ss.insertSheet(SHEET_POSTS);
        sheetPosts.appendRow(POST_COLUMNS);
      }

      const newId = post.id || ('book-' + Date.now());
      const newStatus = 'pending'; // Luôn là pending khi công khai gửi bài
      const createdAt = post.createdAt || new Date().toISOString();

      sheetPosts.appendRow([
        newId,
        post.title,
        post.author,
        post.category || 'Truyện AI Sáng Tác',
        post.summary || '',
        post.content || '',
        post.cover || '',
        Number(post.views) || 0,
        newStatus,
        createdAt
      ]);

      return jsonResponse({
        success: true,
        message: 'Đăng bài thành công, đang chờ ban quản trị duyệt!',
        id: newId
      });
    }

    // 2. Cập nhật trạng thái bài viết (Duyệt hoặc Từ chối)
    if (action === 'updateStatus') {
      const id = payload.id;
      const newStatus = payload.status; // 'approved' | 'rejected' | 'pending'
      if (!id || !newStatus) {
        return jsonResponse({ success: false, message: 'Thiếu id hoặc trạng thái mới.' });
      }

      const sheetPosts = ss.getSheetByName(SHEET_POSTS);
      if (!sheetPosts) return jsonResponse({ success: false, message: 'Bảng Posts chưa tồn tại.' });

      const data = sheetPosts.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(id)) {
          sheetPosts.getRange(i + 1, 9).setValue(newStatus); // Cột 9 là status
          return jsonResponse({ success: true, message: `Đã cập nhật trạng thái bài viết thành ${newStatus}.` });
        }
      }
      return jsonResponse({ success: false, message: 'Không tìm thấy bài viết.' });
    }

    // 3. Xóa bài viết
    if (action === 'deletePost') {
      const id = payload.id;
      if (!id) return jsonResponse({ success: false, message: 'Thiếu id bài viết.' });

      const sheetPosts = ss.getSheetByName(SHEET_POSTS);
      if (!sheetPosts) return jsonResponse({ success: false, message: 'Bảng Posts chưa tồn tại.' });

      const data = sheetPosts.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(id)) {
          sheetPosts.deleteRow(i + 1);
          return jsonResponse({ success: true, message: 'Đã xóa bài viết thành công.' });
        }
      }
      return jsonResponse({ success: false, message: 'Không tìm thấy bài viết để xóa.' });
    }

    // 4. Thêm thể loại mới
    if (action === 'addCategory') {
      const category = payload.category;
      if (!category || !category.name) {
        return jsonResponse({ success: false, message: 'Thiếu tên thể loại.' });
      }

      let sheetCats = ss.getSheetByName(SHEET_CATEGORIES);
      if (!sheetCats) {
        sheetCats = ss.insertSheet(SHEET_CATEGORIES);
        sheetCats.appendRow(CAT_COLUMNS);
      }

      const newId = category.id || ('cat-' + Date.now());
      sheetCats.appendRow([
        newId,
        category.name,
        category.icon || '📖'
      ]);

      return jsonResponse({ success: true, id: newId, message: 'Thêm thể loại thành công.' });
    }

    // 5. Xóa thể loại
    if (action === 'deleteCategory') {
      const id = payload.id;
      if (!id) return jsonResponse({ success: false, message: 'Thiếu id thể loại.' });

      const sheetCats = ss.getSheetByName(SHEET_CATEGORIES);
      if (!sheetCats) return jsonResponse({ success: false, message: 'Bảng Categories chưa tồn tại.' });

      const data = sheetCats.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(id)) {
          sheetCats.deleteRow(i + 1);
          return jsonResponse({ success: true, message: 'Đã xóa thể loại.' });
        }
      }
      return jsonResponse({ success: false, message: 'Không tìm thấy thể loại để xóa.' });
    }

    // 6. Thêm sách truyện giấy mới (addPhysicalBook)
    if (action === 'addPhysicalBook') {
      const book = payload.book;
      if (!book || !book.title) {
        return jsonResponse({ success: false, message: 'Thiếu tên sách truyện giấy.' });
      }

      let sheetPhysical = ss.getSheetByName(SHEET_PHYSICAL_BOOKS);
      if (!sheetPhysical) {
        sheetPhysical = ss.insertSheet(SHEET_PHYSICAL_BOOKS);
        sheetPhysical.appendRow(PHYSICAL_COLUMNS);
      }

      const newId = book.id || ('pb-' + Date.now());
      sheetPhysical.appendRow([
        newId,
        book.code || '',
        book.title,
        book.author || '',
        book.category || '',
        book.shelf || '',
        book.status || 'available',
        book.borrower || '',
        book.borrowDate || '',
        book.returnDate || '',
        book.note || ''
      ]);

      return jsonResponse({ success: true, id: newId, message: 'Đã thêm sách truyện giấy thành công.' });
    }

    // 7. Cập nhật sách truyện giấy / mượn trả (updatePhysicalBook)
    if (action === 'updatePhysicalBook') {
      const id = payload.id;
      const updateData = payload.book || {};
      if (!id) return jsonResponse({ success: false, message: 'Thiếu id sách giấy.' });

      const sheetPhysical = ss.getSheetByName(SHEET_PHYSICAL_BOOKS);
      if (!sheetPhysical) return jsonResponse({ success: false, message: 'Bảng PhysicalBooks chưa tồn tại.' });

      const data = sheetPhysical.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(id)) {
          if (updateData.code !== undefined) sheetPhysical.getRange(i + 1, 2).setValue(updateData.code);
          if (updateData.title !== undefined) sheetPhysical.getRange(i + 1, 3).setValue(updateData.title);
          if (updateData.author !== undefined) sheetPhysical.getRange(i + 1, 4).setValue(updateData.author);
          if (updateData.category !== undefined) sheetPhysical.getRange(i + 1, 5).setValue(updateData.category);
          if (updateData.shelf !== undefined) sheetPhysical.getRange(i + 1, 6).setValue(updateData.shelf);
          if (updateData.status !== undefined) sheetPhysical.getRange(i + 1, 7).setValue(updateData.status);
          if (updateData.borrower !== undefined) sheetPhysical.getRange(i + 1, 8).setValue(updateData.borrower);
          if (updateData.borrowDate !== undefined) sheetPhysical.getRange(i + 1, 9).setValue(updateData.borrowDate);
          if (updateData.returnDate !== undefined) sheetPhysical.getRange(i + 1, 10).setValue(updateData.returnDate);
          if (updateData.note !== undefined) sheetPhysical.getRange(i + 1, 11).setValue(updateData.note);
          return jsonResponse({ success: true, message: 'Đã cập nhật sách truyện giấy thành công.' });
        }
      }
      return jsonResponse({ success: false, message: 'Không tìm thấy sách giấy để cập nhật.' });
    }

    // 8. Xóa sách truyện giấy (deletePhysicalBook)
    if (action === 'deletePhysicalBook') {
      const id = payload.id;
      if (!id) return jsonResponse({ success: false, message: 'Thiếu id sách giấy.' });

      const sheetPhysical = ss.getSheetByName(SHEET_PHYSICAL_BOOKS);
      if (!sheetPhysical) return jsonResponse({ success: false, message: 'Bảng PhysicalBooks chưa tồn tại.' });

      const data = sheetPhysical.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(id)) {
          sheetPhysical.deleteRow(i + 1);
          return jsonResponse({ success: true, message: 'Đã xóa sách truyện giấy thành công.' });
        }
      }
      return jsonResponse({ success: false, message: 'Không tìm thấy sách giấy để xóa.' });
    }

    // 9. Đồng bộ toàn bộ dữ liệu ban đầu từ Client lên Sheet
    if (action === 'seedInitialData') {
      setupDatabase();
      return jsonResponse({ success: true, message: 'Đã đồng bộ toàn bộ truyện mẫu, thể loại và 10 sách truyện giấy lên Google Sheets!' });
    }

    return jsonResponse({ success: false, message: 'Hành động không hợp lệ: ' + action });

  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

/**
 * Trả về phản hồi dạng JSON với MIME Type chuẩn
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
