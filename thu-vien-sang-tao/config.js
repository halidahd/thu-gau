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
    return localStorage.getItem('thuvien_api_endpoint') || '';
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
        this.initLocalData();
        let apiSuccess = false;

        if (this.hasApi()) {
            try {
                const res = await this.postToApi({
                    action: 'updateStatus',
                    id: postId,
                    status: newStatus
                });
                if (res && res.success) {
                    apiSuccess = true;
                }
            } catch (err) {
                console.warn('[StorageService] Lỗi cập nhật status lên API:', err);
            }
        }

        // Cập nhật LocalStorage
        const localBooks = JSON.parse(localStorage.getItem('thuvien_4b_books') || '[]');
        const target = localBooks.find(b => b.id === postId);
        if (target) {
            target.status = newStatus;
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
