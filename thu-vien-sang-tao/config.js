/**
 * CẤU HÌNH VÀ DỊCH VỤ DỮ LIỆU TỦ SÁCH SỐ 4B
 * Hỗ trợ đồng bộ hai chiều với Google Sheets API (Google Apps Script Web App)
 * và Fallback LocalStorage tự động khi offline.
 */

// URL Google Apps Script Web App triển khai từ file Code.gs
// Có thể cấu hình tại đây hoặc nhập trực tiếp trong trang admin.html
const DEFAULT_API_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwDKIc7iBpEnSdWHM6_Sj8-koERVExmZILDPavNg57su2LV6aJXB34ctx5JLXeeJ3WSxw/exec';

// Lấy API Endpoint từ LocalStorage (nếu admin đã cấu hình trong Dashboard) hoặc dùng mặc định
function getApiEndpoint() {
    return localStorage.getItem('thuvien_api_endpoint') || DEFAULT_API_ENDPOINT || '';
}

function setApiEndpoint(url) {
    if (url) {
        localStorage.setItem('thuvien_api_endpoint', url.trim());
    } else {
        localStorage.removeItem('thuvien_api_endpoint');
    }
}

// Danh mục thể loại mặc định
const INITIAL_CATEGORIES = [
    { id: 'cat-1', name: 'Truyện AI Sáng Tác', icon: '✨' },
    { id: 'cat-2', name: 'Truyện Song Ngữ', icon: '🌐' },
    { id: 'cat-3', name: 'Thơ Ca', icon: '🌾' },
    { id: 'cat-4', name: 'STEM & Khoa Học', icon: '🚀' }
];

// Danh sách 10 sách truyện giấy mẫu (Sổ theo dõi mượn trả tại lớp 4B)
const INITIAL_PHYSICAL_BOOKS = [
    {
        id: 'pb-1',
        code: 'SG-01',
        title: 'Dế Mèn Phiêu Lưu Ký',
        author: 'Tô Hoài',
        category: 'Văn học thiếu nhi',
        shelf: 'Kệ A1',
        status: 'borrowed', // 'available' | 'borrowed'
        borrower: 'Trần Bảo Nam (4B)',
        borrowDate: '2024-11-18',
        returnDate: '2024-11-25',
        note: 'Bìa cứng, giữ gìn tốt'
    },
    {
        id: 'pb-2',
        code: 'SG-02',
        title: 'Đất Rừng Phương Nam',
        author: 'Đoàn Giỏi',
        category: 'Văn học thiếu nhi',
        shelf: 'Kệ A1',
        status: 'available',
        borrower: '',
        borrowDate: '',
        returnDate: '',
        note: 'Sách mới'
    },
    {
        id: 'pb-3',
        code: 'SG-03',
        title: 'Kính Vạn Hoa (Tập 1 - Nhà Ảo Thuật)',
        author: 'Nguyễn Nhật Ánh',
        category: 'Truyện dài thiếu nhi',
        shelf: 'Kệ A2',
        status: 'borrowed',
        borrower: 'Nguyễn Hoàng Long (4B)',
        borrowDate: '2024-11-20',
        returnDate: '2024-11-27',
        note: 'Sách bìa mềm'
    },
    {
        id: 'pb-4',
        code: 'SG-04',
        title: 'Totto-chan Bên Cửa Sổ',
        author: 'Kuroyanagi Tetsuko',
        category: 'Văn học kinh điển',
        shelf: 'Kệ B1',
        status: 'available',
        borrower: '',
        borrowDate: '',
        returnDate: '',
        note: 'Có tranh minh họa'
    },
    {
        id: 'pb-5',
        code: 'SG-05',
        title: 'Hoàng Tử Bé',
        author: 'Antoine de Saint-Exupéry',
        category: 'Truyện ngụ ngôn',
        shelf: 'Kệ B1',
        status: 'borrowed',
        borrower: 'Phạm Thảo Vy (4B)',
        borrowDate: '2024-11-19',
        returnDate: '2024-11-26',
        note: 'Bản dịch mới có màu'
    },
    {
        id: 'pb-6',
        code: 'SG-06',
        title: 'Thần Đồng Đất Việt (Tập 15 - Trí Tuệ Trạng Tí)',
        author: 'Phan Thị',
        category: 'Truyện tranh lịch sử',
        shelf: 'Kệ C1',
        status: 'borrowed',
        borrower: 'Chu Nam Phong (4B)',
        borrowDate: '2024-11-21',
        returnDate: '2024-11-28',
        note: 'Rất được các bạn yêu thích'
    },
    {
        id: 'pb-7',
        code: 'SG-07',
        title: 'Doraemon Tuyển Tập Truyện Dài (Tập 3 - Thám Hiểm Lòng Đất)',
        author: 'Fujiko F. Fujio',
        category: 'Truyện tranh khoa học',
        shelf: 'Kệ C1',
        status: 'available',
        borrower: '',
        borrowDate: '',
        returnDate: '',
        note: 'Có bọc nilon bảo quản'
    },
    {
        id: 'pb-8',
        code: 'SG-08',
        title: 'Bách Khoa Tri Thức - Kỳ Quan Thiên Nhiên Thế Giới',
        author: 'Nhiều tác giả',
        category: 'Khoa học & Khám phá',
        shelf: 'Kệ D2',
        status: 'available',
        borrower: '',
        borrowDate: '',
        returnDate: '',
        note: 'Sách khổ lớn, đọc tại lớp hoặc mượn về'
    },
    {
        id: 'pb-9',
        code: 'SG-09',
        title: 'Những Tấm Lòng Cao Cả',
        author: 'Edmondo De Amicis',
        category: 'Giáo dục đạo đức',
        shelf: 'Kệ A3',
        status: 'borrowed',
        borrower: 'Vũ Quỳnh Mai (4B)',
        borrowDate: '2024-11-17',
        returnDate: '2024-11-24',
        note: 'Bài học cảm động'
    },
    {
        id: 'pb-10',
        code: 'SG-10',
        title: '10 Vạn Câu Hỏi Vì Sao - Bí Ẩn Quanh Em',
        author: 'Nhiều tác giả',
        category: 'Khoa học vui',
        shelf: 'Kệ D1',
        status: 'available',
        borrower: '',
        borrowDate: '',
        returnDate: '',
        note: 'Sách kiến thức đời sống'
    }
];

// Danh sách 4 truyện gốc hiện có của Tủ Sách Số 4B
const INITIAL_BOOKS = [
    {
        id: 'book-1',
        title: 'Hành Trình Khám Phá Vũ Trụ Cùng AI',
        author: 'Chu Nam Phong (Lớp 4B)',
        category: 'Truyện AI Sáng Tác',
        summary: 'Một câu chuyện phiêu lưu kỳ thú qua các hành tinh do em Nam Phong viết kịch bản và AI minh họa.',
        cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop',
        views: 124,
        status: 'approved',
        createdAt: '2024-11-15T08:00:00.000Z',
        content: `Ngày xửa ngày xưa, ở một ngôi trường tiểu học xinh đẹp, có một cậu bé tên là Nam Phong rất thích quan sát bầu trời đêm. 

Một ngày nọ, Nam Phong chế tạo ra một chú robot nhỏ tên là Aki bằng công nghệ Trí tuệ Nhân tạo. Aki có thể nói chuyện và giải đáp mọi thắc mắc của Nam Phong về các vì sao.

Cùng nhau, Nam Phong và Aki đã thực hiện một chuyến du hành tưởng tượng xuyên qua Hệ Mặt Trời, ghé thăm Sao Hỏa đỏ rực và những vành đai rực rỡ của Sao Thổ. Qua chuyến đi, Nam Phong hiểu rằng khoa học và trí tuệ nhân tạo là người bạn đồng hành tuyệt vời giúp con người vươn tới những ước mơ cao xa.`
    },
    {
        id: 'book-2',
        title: 'The Little Bear & The Forest / Chú Gấu Nhỏ Và Rừng Xanh',
        author: 'Nguyễn Kiều Anh (Lớp 4B)',
        category: 'Truyện Song Ngữ',
        summary: 'Truyện tranh song ngữ Anh - Việt dạy bài học về việc bảo vệ môi trường và yêu thương cây xanh.',
        cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop',
        views: 98,
        status: 'approved',
        createdAt: '2024-11-16T09:30:00.000Z',
        content: `Once upon a time, in a green forest, lived a little bear named Barnaby. Barnaby loved planting trees.
(Ngày xửa ngày xưa, trong một khu rừng xanh tươi, có một chú gấu nhỏ tên là Barnaby. Barnaby rất thích trồng cây.)

One sunny morning, he found a withered flower near the stream. He carefully watered it every day.
(Một sáng nắng đẹp, chú tìm thấy một bông hoa héo bên dòng suối. Chú cẩn thận tưới nước cho nó mỗi ngày.)

Lessons learned: Nature is our best friend. Protect the green planet!
(Bài học rút ra: Thiên nhiên là người bạn tốt nhất của chúng ta. Hãy bảo vệ hành tinh xanh!)`
    },
    {
        id: 'book-3',
        title: 'Nắng Khai Trường & Thầy Cô Kính Yêu',
        author: 'Nguyễn Hải An (Lớp 4B)',
        category: 'Thơ Ca',
        summary: 'Tập thơ ngắn xúc động chào mừng Ngày Nhà giáo Việt Nam 20/11 do học sinh sáng tác.',
        cover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop',
        views: 215,
        status: 'approved',
        createdAt: '2024-11-18T10:15:00.000Z',
        content: `Nắng thu vàng rực khoảng sân trường
Tiếng giảng bài cô đọng yêu thương
Hàng cây xanh mát nghiêng đầu đón
Nhiệt huyết thầy gieo muôn vạn phương.

Chúng em ghi nhớ lời cô dạy
Chăm ngoan học tốt xứng cháu Bác Hồ
Mái trường Nam Đồng thân thương quá
Nâng bước tuổi thơ dệt ước mơ!`
    },
    {
        id: 'book-4',
        title: 'Bí Mật Của Nước & Sự Tuần Hoàn Kỳ Diệu',
        author: 'Chu Thị Minh Hằng (Lớp 4B)',
        category: 'STEM & Khoa Học',
        summary: 'Sách khám phá khoa học vui kết hợp bài tập thực nghiệm đơn giản tại lớp học.',
        cover: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop',
        views: 85,
        status: 'approved',
        createdAt: '2024-11-19T14:20:00.000Z',
        content: `Bạn có biết giọt nước mưa rơi trên lá cây từ đâu đến không?

Nước sông hồ khi gặp ánh nắng mặt trời chiếu vào sẽ bốc hơi bay lên không trung. Khi lên cao gặp lạnh, hơi nước ngưng tụ lại thành những đám mây bồng bềnh.

Khi các đám mây trở nên nặng trĩu, những giọt nước bé nhỏ rơi xuống tạo thành mưa. Đó chính là vòng tuần hoàn kỳ diệu của nước trong thiên nhiên mà chúng mình được học trong môn Khoa học!`
    }
];

/**
 * StorageService - Lớp quản lý dữ liệu tập trung
 */
const StorageService = {
    // Khởi tạo LocalStorage nếu chưa có
    initLocalData() {
        if (!localStorage.getItem('thuvien_4b_books')) {
            localStorage.setItem('thuvien_4b_books', JSON.stringify(INITIAL_BOOKS));
        }
        if (!localStorage.getItem('thuvien_4b_categories')) {
            localStorage.setItem('thuvien_4b_categories', JSON.stringify(INITIAL_CATEGORIES));
        }
        if (!localStorage.getItem('thuvien_4b_physical_books')) {
            localStorage.setItem('thuvien_4b_physical_books', JSON.stringify(INITIAL_PHYSICAL_BOOKS));
        }
    },

    // Kiểm tra xem đã kết nối Google Sheets hay chưa
    hasApi() {
        const endpoint = getApiEndpoint();
        return Boolean(endpoint && endpoint.startsWith('https://script.google.com/macros/s/'));
    },

    // Gửi POST request dạng text/plain để tránh preflight CORS trên Google Apps Script Web App
    async postToApi(data) {
        const endpoint = getApiEndpoint();
        if (!endpoint) throw new Error('Chưa cấu hình API Endpoint Google Apps Script!');

        const response = await fetch(endpoint, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Lỗi máy chủ (${response.status}): ${response.statusText}`);
        }

        const resData = await response.json();
        return resData;
    },

    // Lấy danh sách bài viết (Hỗ trợ lọc status: 'approved', 'pending', 'rejected', 'all')
    async getPosts(status = 'all') {
        this.initLocalData();
        const endpoint = getApiEndpoint();

        if (this.hasApi()) {
            try {
                const url = new URL(endpoint);
                url.searchParams.set('action', 'getPosts');
                if (status && status !== 'all') {
                    url.searchParams.set('status', status);
                }

                const response = await fetch(url.toString(), { method: 'GET', mode: 'cors' });
                if (response.ok) {
                    const result = await response.json();
                    if (result && Array.isArray(result.data)) {
                        // Cập nhật lại LocalStorage cache để dùng khi offline
                        if (status === 'all') {
                            localStorage.setItem('thuvien_4b_books', JSON.stringify(result.data));
                        }
                        return result.data;
                    }
                }
            } catch (err) {
                console.warn('[StorageService] Không thể kết nối Google Sheets API, chuyển sang dùng LocalStorage:', err);
            }
        }

        // Fallback: Đọc từ LocalStorage
        try {
            const localData = JSON.parse(localStorage.getItem('thuvien_4b_books') || '[]');
            if (status === 'all') return localData;
            return localData.filter(item => item.status === status);
        } catch (e) {
            return INITIAL_BOOKS.filter(item => status === 'all' || item.status === status);
        }
    },

    // Lấy danh sách thể loại
    async getCategories() {
        this.initLocalData();
        const endpoint = getApiEndpoint();

        if (this.hasApi()) {
            try {
                const url = new URL(endpoint);
                url.searchParams.set('action', 'getCategories');
                const response = await fetch(url.toString(), { method: 'GET', mode: 'cors' });
                if (response.ok) {
                    const result = await response.json();
                    if (result && Array.isArray(result.data) && result.data.length > 0) {
                        localStorage.setItem('thuvien_4b_categories', JSON.stringify(result.data));
                        return result.data;
                    }
                }
            } catch (err) {
                console.warn('[StorageService] Không thể lấy Categories từ API, dùng LocalStorage:', err);
            }
        }

        try {
            return JSON.parse(localStorage.getItem('thuvien_4b_categories') || JSON.stringify(INITIAL_CATEGORIES));
        } catch (e) {
            return INITIAL_CATEGORIES;
        }
    },

    // Đăng bài viết mới (Mặc định status: "pending")
    async createPost(postData) {
        this.initLocalData();
        const newPost = {
            id: 'book-' + Date.now(),
            title: postData.title,
            author: postData.author,
            category: postData.category,
            summary: postData.summary,
            content: postData.content,
            cover: postData.cover || '',
            views: 0,
            status: 'pending', // Luôn là pending khi học sinh/người dùng gửi bài
            createdAt: new Date().toISOString()
        };

        let apiSuccess = false;
        if (this.hasApi()) {
            try {
                const res = await this.postToApi({
                    action: 'createPost',
                    post: newPost
                });
                if (res && res.success) {
                    apiSuccess = true;
                }
            } catch (err) {
                console.warn('[StorageService] Gửi bài lên Google Sheets API thất bại, lưu tạm local:', err);
            }
        }

        // Luôn lưu bản sao vào LocalStorage
        const localBooks = JSON.parse(localStorage.getItem('thuvien_4b_books') || '[]');
        localBooks.unshift(newPost);
        localStorage.setItem('thuvien_4b_books', JSON.stringify(localBooks));

        return { success: true, post: newPost, remoteSynced: apiSuccess };
    },

    // Cập nhật trạng thái bài viết (Duyệt: 'approved' | Từ chối: 'rejected')
    async updatePostStatus(postId, newStatus) {
        return this.updatePost(postId, { status: newStatus });
    },

    // Chỉnh sửa toàn diện nội dung bài viết (Dành cho Admin)
    async updatePost(postId, updatedData) {
        this.initLocalData();
        let apiSuccess = false;

        if (this.hasApi()) {
            try {
                const res = await this.postToApi({
                    action: 'updatePost',
                    id: postId,
                    post: updatedData
                });
                if (res && res.success) {
                    apiSuccess = true;
                }
            } catch (err) {
                console.warn('[StorageService] Lỗi cập nhật bài viết lên API:', err);
            }
        }

        // Cập nhật LocalStorage
        const localBooks = JSON.parse(localStorage.getItem('thuvien_4b_books') || '[]');
        const targetIndex = localBooks.findIndex(b => b.id === postId);
        if (targetIndex !== -1) {
            localBooks[targetIndex] = {
                ...localBooks[targetIndex],
                ...updatedData
            };
            localStorage.setItem('thuvien_4b_books', JSON.stringify(localBooks));
        }

        return { success: true, remoteSynced: apiSuccess };
    },

    // Xóa bài viết
    async deletePost(postId) {
        this.initLocalData();
        let apiSuccess = false;

        if (this.hasApi()) {
            try {
                const res = await this.postToApi({
                    action: 'deletePost',
                    id: postId
                });
                if (res && res.success) {
                    apiSuccess = true;
                }
            } catch (err) {
                console.warn('[StorageService] Lỗi xóa bài trên API:', err);
            }
        }

        // Xóa trong LocalStorage
        let localBooks = JSON.parse(localStorage.getItem('thuvien_4b_books') || '[]');
        localBooks = localBooks.filter(b => b.id !== postId);
        localStorage.setItem('thuvien_4b_books', JSON.stringify(localBooks));

        return { success: true, remoteSynced: apiSuccess };
    },

    // Tăng lượt xem (views)
    async incrementViews(postId) {
        this.initLocalData();
        // Cập nhật local ngay lập tức
        const localBooks = JSON.parse(localStorage.getItem('thuvien_4b_books') || '[]');
        const target = localBooks.find(b => b.id === postId);
        if (target) {
            target.views = (target.views || 0) + 1;
            localStorage.setItem('thuvien_4b_books', JSON.stringify(localBooks));
        }

        if (this.hasApi()) {
            try {
                // Fire and forget view counter increment
                const endpoint = getApiEndpoint();
                const url = new URL(endpoint);
                url.searchParams.set('action', 'incrementViews');
                url.searchParams.set('id', postId);
                fetch(url.toString(), { method: 'GET', mode: 'no-cors' }).catch(() => {});
            } catch (e) {}
        }
    },

    // Thêm thể loại mới
    async addCategory(name, icon = '📖') {
        this.initLocalData();
        const newCat = {
            id: 'cat-' + Date.now(),
            name: name.trim(),
            icon: icon.trim() || '📖'
        };

        let apiSuccess = false;
        if (this.hasApi()) {
            try {
                const res = await this.postToApi({
                    action: 'addCategory',
                    category: newCat
                });
                if (res && res.success) {
                    apiSuccess = true;
                }
            } catch (err) {
                console.warn('[StorageService] Lỗi thêm category lên API:', err);
            }
        }

        // Lưu LocalStorage
        const cats = JSON.parse(localStorage.getItem('thuvien_4b_categories') || '[]');
        cats.push(newCat);
        localStorage.setItem('thuvien_4b_categories', JSON.stringify(cats));

        return { success: true, category: newCat, remoteSynced: apiSuccess };
    },

    // Xóa thể loại
    async deleteCategory(categoryId) {
        this.initLocalData();
        let apiSuccess = false;
        if (this.hasApi()) {
            try {
                const res = await this.postToApi({
                    action: 'deleteCategory',
                    id: categoryId
                });
                if (res && res.success) {
                    apiSuccess = true;
                }
            } catch (err) {
                console.warn('[StorageService] Lỗi xóa category trên API:', err);
            }
        }

        let cats = JSON.parse(localStorage.getItem('thuvien_4b_categories') || '[]');
        cats = cats.filter(c => c.id !== categoryId);
        localStorage.setItem('thuvien_4b_categories', JSON.stringify(cats));

        return { success: true, remoteSynced: apiSuccess };
    },

    // ==========================================
    // QUẢN LÝ SÁCH TRUYỆN GIẤY & MƯỢN TRẢ TẠI LỚP
    // ==========================================

    // Lấy danh sách sách truyện giấy
    async getPhysicalBooks() {
        this.initLocalData();
        const endpoint = getApiEndpoint();

        if (this.hasApi()) {
            try {
                const url = new URL(endpoint);
                url.searchParams.set('action', 'getPhysicalBooks');
                const response = await fetch(url.toString(), { method: 'GET', mode: 'cors' });
                if (response.ok) {
                    const result = await response.json();
                    if (result && Array.isArray(result.data)) {
                        localStorage.setItem('thuvien_4b_physical_books', JSON.stringify(result.data));
                        return result.data;
                    }
                }
            } catch (err) {
                console.warn('[StorageService] Không thể lấy Physical Books từ API, dùng LocalStorage:', err);
            }
        }

        try {
            return JSON.parse(localStorage.getItem('thuvien_4b_physical_books') || JSON.stringify(INITIAL_PHYSICAL_BOOKS));
        } catch (e) {
            return INITIAL_PHYSICAL_BOOKS;
        }
    },

    // Thêm sách truyện giấy mới
    async addPhysicalBook(bookData) {
        this.initLocalData();
        const newBook = {
            id: 'pb-' + Date.now(),
            code: bookData.code ? bookData.code.trim().toUpperCase() : ('SG-' + String(Math.floor(Math.random() * 90) + 10)),
            title: bookData.title.trim(),
            author: bookData.author ? bookData.author.trim() : 'Nhiều tác giả',
            category: bookData.category || 'Văn học thiếu nhi',
            shelf: bookData.shelf || 'Kệ sách lớp 4B',
            status: bookData.status || 'available', // 'available' | 'borrowed'
            borrower: bookData.borrower ? bookData.borrower.trim() : '',
            borrowDate: bookData.borrowDate || '',
            returnDate: bookData.returnDate || '',
            note: bookData.note || ''
        };

        let apiSuccess = false;
        if (this.hasApi()) {
            try {
                const res = await this.postToApi({
                    action: 'addPhysicalBook',
                    book: newBook
                });
                if (res && res.success) apiSuccess = true;
            } catch (err) {
                console.warn('[StorageService] Lỗi thêm Physical Book lên API:', err);
            }
        }

        const books = JSON.parse(localStorage.getItem('thuvien_4b_physical_books') || '[]');
        books.unshift(newBook);
        localStorage.setItem('thuvien_4b_physical_books', JSON.stringify(books));

        return { success: true, book: newBook, remoteSynced: apiSuccess };
    },

    // Cập nhật thông tin sách truyện giấy hoặc tình trạng mượn trả
    async updatePhysicalBook(id, updateData) {
        this.initLocalData();
        let apiSuccess = false;

        if (this.hasApi()) {
            try {
                const res = await this.postToApi({
                    action: 'updatePhysicalBook',
                    id: id,
                    book: updateData
                });
                if (res && res.success) apiSuccess = true;
            } catch (err) {
                console.warn('[StorageService] Lỗi cập nhật Physical Book lên API:', err);
            }
        }

        const books = JSON.parse(localStorage.getItem('thuvien_4b_physical_books') || '[]');
        const idx = books.findIndex(b => b.id === id);
        if (idx !== -1) {
            books[idx] = { ...books[idx], ...updateData };
            localStorage.setItem('thuvien_4b_physical_books', JSON.stringify(books));
        }

        return { success: true, remoteSynced: apiSuccess };
    },

    // Xóa sách truyện giấy
    async deletePhysicalBook(id) {
        this.initLocalData();
        let apiSuccess = false;

        if (this.hasApi()) {
            try {
                const res = await this.postToApi({
                    action: 'deletePhysicalBook',
                    id: id
                });
                if (res && res.success) apiSuccess = true;
            } catch (err) {
                console.warn('[StorageService] Lỗi xóa Physical Book trên API:', err);
            }
        }

        let books = JSON.parse(localStorage.getItem('thuvien_4b_physical_books') || '[]');
        books = books.filter(b => b.id !== id);
        localStorage.setItem('thuvien_4b_physical_books', JSON.stringify(books));

        return { success: true, remoteSynced: apiSuccess };
    },

    // Hành động nhanh: Đánh dấu Đã trả sách
    async quickReturnPhysicalBook(id) {
        return this.updatePhysicalBook(id, {
            status: 'available',
            borrower: '',
            borrowDate: '',
            returnDate: ''
        });
    },

    // Đồng bộ đẩy dữ liệu mẫu ban đầu (4 truyện hiện có) lên Google Sheets
    async seedInitialDataToRemote() {
        if (!this.hasApi()) {
            throw new Error('Chưa thiết lập URL Google Apps Script Web App!');
        }

        const res = await this.postToApi({
            action: 'seedInitialData',
            posts: INITIAL_BOOKS,
            categories: INITIAL_CATEGORIES
        });

        return res;
    },

    // Kiểm tra kết nối API
    async testConnection() {
        if (!this.hasApi()) {
            return { ok: false, message: 'Chưa cấu hình URL API.' };
        }
        try {
            const endpoint = getApiEndpoint();
            const url = new URL(endpoint);
            url.searchParams.set('action', 'ping');
            const res = await fetch(url.toString(), { method: 'GET', mode: 'cors' });
            if (res.ok) {
                const json = await res.json();
                return { ok: true, message: json.message || 'Kết nối Google Sheets API thành công!' };
            } else {
                return { ok: false, message: `Mã phản hồi từ Google: ${res.status}` };
            }
        } catch (err) {
            return { ok: false, message: `Lỗi kết nối: ${err.message}` };
        }
    }
};

// Khởi chạy lưu trữ cục bộ khi script được tải
StorageService.initLocalData();
