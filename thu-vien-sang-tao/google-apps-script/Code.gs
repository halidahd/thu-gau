/**
 * =========================================================================
 * BACKEND GOOGLE APPS SCRIPT CHO HỆ THỐNG TỦ SÁCH SỐ 4B
 * Trường TH Nam Đồng - Hội thi Tủ sách chia sẻ
 * =========================================================================
 * 
 * Hướng dẫn triển khai nhanh:
 * 1. Mở file Google Sheet "CSDL Tu Sach So 4B" của bạn.
 * 2. Vào menu "Tiện ích mở rộng" (Extensions) > "Apps Script".
 * 3. Xóa hết mã cũ, dán toàn bộ nội dung file này vào file Code.gs.
 * 4. Bấm nút "Triển khai" (Deploy) > "Quản lý bản triển khai" (Manage deployments).
 *    - Bấm biểu tượng cây bút chì ✏️ > Phiên bản: chọn "Phiên bản mới" (New version).
 *    - Bấm "Triển khai" (Deploy).
 * 
 * LƯU Ý BẢO VỆ DỮ LIỆU:
 * - Mã nguồn này giữ nguyên 100% dữ liệu thực tế hiện có trên Google Sheet của bạn.
 * - Đã loại bỏ hoàn toàn các đoạn chèn dữ liệu mẫu (dummy data), không bao giờ xóa dữ liệu của bạn!
 */

// Tên các bảng tính
const SHEET_POSTS = 'Posts';
const SHEET_CATEGORIES = 'Categories';
const SHEET_PHYSICAL_BOOKS = 'PhysicalBooks';
const SHEET_WISHES = 'Wishes2011';

// Cấu trúc cột của Sheet Posts (Đã mở rộng hỗ trợ Truyện Tranh PDF: pdfUrl, type)
const POST_COLUMNS = ['id', 'title', 'author', 'category', 'summary', 'content', 'cover', 'views', 'status', 'createdAt', 'pdfUrl', 'type'];

// Cấu trúc cột của Sheet Categories
const CAT_COLUMNS = ['id', 'name', 'icon'];

// Cấu trúc cột của Sheet PhysicalBooks (Sách truyện giấy & mượn trả)
const PHYSICAL_COLUMNS = ['id', 'code', 'title', 'author', 'category', 'shelf', 'status', 'borrower', 'borrowDate', 'returnDate', 'note'];

// Cấu trúc cột của Sheet Wishes2011 (Lời chúc tri ân Thầy Cô 20/11)
const WISH_COLUMNS = ['id', 'sender', 'flower', 'message', 'date', 'createdAt'];

/**
 * Hàm kiểm tra cấu trúc cơ sở dữ liệu (BẢO VỆ DỮ LIỆU CỦA BẠN 100%)
 * - Giữ nguyên toàn bộ bài viết, thể loại, sách giấy và lời chúc hiện có trên Sheet của bạn.
 * - Chỉ tạo Sheet và tiêu đề cột nếu Sheet đó chưa tồn tại hoặc hoàn toàn trống.
 * - ĐÃ XÓA TOÀN BỘ dữ liệu mẫu (dummy data), không bao giờ xóa hay ghi đè dữ liệu thật.
 */
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Helper đảm bảo sheet tồn tại và có dòng tiêu đề cột (header)
  function ensureSheet(sheetName, columns, headerColor) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    // Chỉ thêm dòng tiêu đề nếu sheet hoàn toàn trống
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(columns);
      sheet.getRange(1, 1, 1, columns.length).setFontWeight('bold').setBackground(headerColor);
    }
    return sheet;
  }

  // 1. Đảm bảo có Sheet Posts (Tác phẩm)
  ensureSheet(SHEET_POSTS, POST_COLUMNS, '#dbeafe');

  // 2. Đảm bảo có Sheet Categories (Thể loại)
  ensureSheet(SHEET_CATEGORIES, CAT_COLUMNS, '#fef3c7');

  // 3. Đảm bảo có Sheet PhysicalBooks (Sách truyện giấy)
  ensureSheet(SHEET_PHYSICAL_BOOKS, PHYSICAL_COLUMNS, '#fed7aa');

  // 4. Đảm bảo có Sheet Wishes2011 (Lời chúc 20/11)
  ensureSheet(SHEET_WISHES, WISH_COLUMNS, '#fecdd3');

  // Xóa sheet mặc định "Sheet1" nếu có và đang có nhiều sheet khác và Sheet1 hoàn toàn trống
  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Trang tính1');
  if (defaultSheet && ss.getSheets().length > 4 && defaultSheet.getLastRow() === 0) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }

  Logger.log('✅ Đã kiểm tra cấu trúc cơ sở dữ liệu. Toàn bộ dữ liệu của bạn được bảo toàn nguyên vẹn!');
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

    // 5. Lấy danh sách lời chúc 20/11 (getWishes)
    if (action === 'getWishes') {
      const sheetWishes = ss.getSheetByName(SHEET_WISHES);
      if (!sheetWishes) {
        return jsonResponse({ success: true, data: [] });
      }
      const data = sheetWishes.getDataRange().getValues();
      if (data.length <= 1) return jsonResponse({ success: true, data: [] });

      const wishes = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[0]) continue;
        wishes.push({
          id: String(row[0]),
          sender: String(row[1] || ''),
          flower: String(row[2] || '💐 Bó Hoa Tươi Thắm'),
          message: String(row[3] || ''),
          date: String(row[4] || ''),
          createdAt: row[5] ? (row[5] instanceof Date ? row[5].toISOString() : String(row[5])) : new Date().toISOString()
        });
      }
      wishes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return jsonResponse({ success: true, data: wishes });
    }

    // 6. Lấy danh sách bài viết (getPosts)
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
        createdAt: row[9] ? (row[9] instanceof Date ? row[9].toISOString() : String(row[9])) : new Date().toISOString(),
        pdfUrl: String(row[10] || ''),
        type: String(row[11] || (row[10] ? 'pdf' : 'story'))
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
      // Nhận status từ client (ví dụ admin chọn 'approved' khi đăng truyện tranh), mặc định là 'pending' nếu không truyền
      const newStatus = post.status || 'pending';
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
        createdAt,
        post.pdfUrl || '',
        post.type || (post.pdfUrl ? 'pdf' : 'story')
      ]);

      const returnMsg = (newStatus === 'approved')
        ? 'Xuất bản tác phẩm thành công lên thư viện!'
        : 'Đăng bài thành công, đang chờ ban quản trị duyệt!';

      return jsonResponse({
        success: true,
        message: returnMsg,
        id: newId,
        status: newStatus
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

    // 2.5. Chỉnh sửa toàn diện nội dung bài viết (Update Post)
    if (action === 'updatePost') {
      const id = payload.id;
      const postData = payload.post || {};
      if (!id) return jsonResponse({ success: false, message: 'Thiếu id bài viết.' });

      const sheetPosts = ss.getSheetByName(SHEET_POSTS);
      if (!sheetPosts) return jsonResponse({ success: false, message: 'Bảng Posts chưa tồn tại.' });

      const data = sheetPosts.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(id)) {
          if (postData.title !== undefined) sheetPosts.getRange(i + 1, 2).setValue(postData.title);
          if (postData.author !== undefined) sheetPosts.getRange(i + 1, 3).setValue(postData.author);
          if (postData.category !== undefined) sheetPosts.getRange(i + 1, 4).setValue(postData.category);
          if (postData.summary !== undefined) sheetPosts.getRange(i + 1, 5).setValue(postData.summary);
          if (postData.content !== undefined) sheetPosts.getRange(i + 1, 6).setValue(postData.content);
          if (postData.cover !== undefined) sheetPosts.getRange(i + 1, 7).setValue(postData.cover);
          if (postData.status !== undefined) sheetPosts.getRange(i + 1, 9).setValue(postData.status);
          if (postData.pdfUrl !== undefined) sheetPosts.getRange(i + 1, 11).setValue(postData.pdfUrl);
          if (postData.type !== undefined) sheetPosts.getRange(i + 1, 12).setValue(postData.type);
          return jsonResponse({ success: true, message: 'Đã cập nhật nội dung bài viết thành công.' });
        }
      }
      return jsonResponse({ success: false, message: 'Không tìm thấy bài viết để cập nhật.' });
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

    // 9. Thêm lời chúc 20/11 mới (createWish)
    if (action === 'createWish') {
      const wish = payload.wish;
      if (!wish || !wish.sender || !wish.message) {
        return jsonResponse({ success: false, message: 'Dữ liệu lời chúc không hợp lệ.' });
      }

      let sheetWishes = ss.getSheetByName(SHEET_WISHES);
      if (!sheetWishes) {
        sheetWishes = ss.insertSheet(SHEET_WISHES);
        sheetWishes.appendRow(WISH_COLUMNS);
      }

      const newId = wish.id || ('wish-' + Date.now());
      const newRow = [
        newId,
        wish.sender,
        wish.flower || '💐 Bó Hoa Tươi Thắm',
        wish.message,
        wish.date || Utilities.formatDate(new Date(), 'GMT+7', 'dd/MM/yyyy'),
        wish.createdAt || new Date().toISOString()
      ];

      sheetWishes.appendRow(newRow);
      return jsonResponse({ success: true, message: 'Đã gửi lời chúc tri ân 20/11 thành công!', id: newId });
    }

    // 10. Cập nhật lời chúc 20/11 (updateWish)
    if (action === 'updateWish') {
      const id = payload.id;
      const updateData = payload.wish;
      if (!id || !updateData) return jsonResponse({ success: false, message: 'Thiếu thông tin cập nhật lời chúc.' });

      const sheetWishes = ss.getSheetByName(SHEET_WISHES);
      if (!sheetWishes) return jsonResponse({ success: false, message: 'Bảng Wishes2011 chưa tồn tại.' });

      const data = sheetWishes.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(id)) {
          if (updateData.sender !== undefined) sheetWishes.getRange(i + 1, 2).setValue(updateData.sender);
          if (updateData.flower !== undefined) sheetWishes.getRange(i + 1, 3).setValue(updateData.flower);
          if (updateData.message !== undefined) sheetWishes.getRange(i + 1, 4).setValue(updateData.message);
          if (updateData.date !== undefined) sheetWishes.getRange(i + 1, 5).setValue(updateData.date);

          return jsonResponse({ success: true, message: 'Cập nhật lời chúc tri ân thành công!' });
        }
      }
      return jsonResponse({ success: false, message: 'Không tìm thấy lời chúc để cập nhật.' });
    }

    // 11. Xóa lời chúc 20/11 (deleteWish)
    if (action === 'deleteWish') {
      const id = payload.id;
      if (!id) return jsonResponse({ success: false, message: 'Thiếu id lời chúc.' });

      const sheetWishes = ss.getSheetByName(SHEET_WISHES);
      if (!sheetWishes) return jsonResponse({ success: false, message: 'Bảng Wishes2011 chưa tồn tại.' });

      const data = sheetWishes.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(id)) {
          sheetWishes.deleteRow(i + 1);
          return jsonResponse({ success: true, message: 'Đã xóa lời chúc thành công.' });
        }
      }
      return jsonResponse({ success: false, message: 'Không tìm thấy lời chúc để xóa.' });
    }

    // 12. Kiểm tra an toàn cấu trúc Sheet (Bảo vệ dữ liệu, không ghi đè)
    if (action === 'seedInitialData') {
      setupDatabase();
      return jsonResponse({ success: true, message: 'Đã kiểm tra cấu trúc bảng thành công! Toàn bộ dữ liệu thực tế trên Sheet của bạn được giữ nguyên vẹn 100%.' });
    }

    // 13. Tải ảnh lên Google Drive miễn phí (uploadImage)
    if (action === 'uploadImage') {
      const base64Data = payload.base64Data;
      if (!base64Data) {
        return jsonResponse({ success: false, message: 'Thiếu dữ liệu ảnh (base64Data).' });
      }

      let cleanBase64 = base64Data;
      if (base64Data.indexOf(';base64,') > -1) {
        cleanBase64 = base64Data.split(';base64,')[1];
      }

      const decoded = Utilities.base64Decode(cleanBase64);
      const mimeType = payload.mimeType || 'image/jpeg';
      const fileName = payload.fileName || ('anh_bia_' + Date.now() + '.jpg');

      const blob = Utilities.newBlob(decoded, mimeType, fileName);

      // Tìm hoặc tạo thư mục lưu trữ ảnh riêng trên Google Drive
      const FOLDER_NAME = 'TuSach4B_AnhBia';
      let folder;
      const folders = DriveApp.getFoldersByName(FOLDER_NAME);
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder(FOLDER_NAME);
      }
      
      // Thiết lập quyền xem công khai cho thư mục và file
      try {
        folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (err) {}

      const file = folder.createFile(blob);
      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (err) {}

      const fileId = file.getId();
      // Link Google User Content (lh3) là link CDN ảnh trực tiếp không bị cookie / CORS chặn
      const directUrl = 'https://lh3.googleusercontent.com/d/' + fileId;
      const downloadUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;

      return jsonResponse({
        success: true,
        message: 'Tải ảnh lên Google Drive thành công!',
        fileId: fileId,
        url: directUrl,
        downloadUrl: downloadUrl,
        folderName: FOLDER_NAME
      });
    }

    // 14. Tải file Truyện Tranh PDF lên Google Drive miễn phí (uploadPdf)
    if (action === 'uploadPdf') {
      const base64Data = payload.base64Data;
      if (!base64Data) {
        return jsonResponse({ success: false, message: 'Thiếu dữ liệu tệp PDF (base64Data).' });
      }

      let cleanBase64 = base64Data;
      if (base64Data.indexOf(';base64,') > -1) {
        cleanBase64 = base64Data.split(';base64,')[1];
      }

      const decoded = Utilities.base64Decode(cleanBase64);
      const fileName = payload.fileName || ('truyen_tranh_' + Date.now() + '.pdf');

      const blob = Utilities.newBlob(decoded, 'application/pdf', fileName);

      // Thư mục lưu trữ riêng cho truyện tranh PDF trên Google Drive
      const FOLDER_NAME = 'TuSach4B_TruyenTranhPDF';
      let folder;
      const folders = DriveApp.getFoldersByName(FOLDER_NAME);
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder(FOLDER_NAME);
      }

      try {
        folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (err) {}

      const file = folder.createFile(blob);
      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (err) {}

      const fileId = file.getId();
      // Link nhúng xem trực tiếp toàn màn hình (Preview) của Google Drive dành cho iframe
      const previewUrl = 'https://drive.google.com/file/d/' + fileId + '/preview';
      const webViewLink = file.getUrl();

      return jsonResponse({
        success: true,
        message: 'Tải truyện tranh PDF lên Google Drive thành công!',
        fileId: fileId,
        url: previewUrl,
        previewUrl: previewUrl,
        webViewLink: webViewLink,
        fileName: fileName,
        folderName: FOLDER_NAME
      });
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
