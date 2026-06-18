# TechShare - Nền tảng kết nối gia sư công nghệ miễn phí

## Giới thiệu

TechShare là nền tảng kết nối cộng đồng, nơi các sinh viên Công nghệ thông tin (TNV) đăng ký làm tình nguyện viên để hỗ trợ miễn phí cho người lớn tuổi và người dân ở vùng sâu vùng xa trong việc tiếp cận công nghệ số.

## Vấn đề xã hội

- Người lớn tuổi gặp khó khăn khi sử dụng smartphone, ứng dụng ngân hàng, mạng xã hội
- Người dân vùng sâu vùng xa thiếu kiến thức về bảo mật trực tuyến
- Thiếu nền tảng kết nối giữa người cần hỗ trợ và người có kiến thức công nghệ

## Mục tiêu

1. Tạo website kết nối sinh viên CNTT tình nguyện với người cần hỗ trợ công nghệ
2. Xây dựng kho tài liệu hướng dẫn sử dụng smartphone và internet an toàn
3. Tạo cộng đồng chia sẻ kiến thức công nghệ miễn phí

## Công nghệ sử dụng

### Frontend
- Next.js 15 (React Framework)
- TypeScript
- TailwindCSS
- Clerk (Xác thực người dùng)
- Socket.IO Client (Chat realtime)
- Axios (Gọi API)
- React Icons

### Backend
- Node.js
- Express.js
- MongoDB (Database)
- Socket.IO (Realtime chat)
- Cloudinary (Upload ảnh/video)
- JWT (Xác thực)
- Mongoose (ORM)

## Cài đặt và chạy dự án

### Yêu cầu
- Node.js >= 18
- MongoDB
- Tài khoản Clerk
- Tài khoản Cloudinary (tùy chọn)

### Backend

```bash
cd techshare-server
npm install
cp .env.example .env
# Cấu hình biến môi trường trong file .env
node server.js
Frontend
bash
cd techshare-client
npm install
cp .env.local.example .env.local
# Cấu hình biến môi trường
npm run dev
Biến môi trường
Backend (.env)
text
PORT=5000
MONGO_URI=mongodb://localhost:27017/techshare
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
Frontend (.env.local)
text
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
NEXT_PUBLIC_API_URL=http://localhost:5000/api
Chức năng chính
1. Đăng ký / Đăng nhập
Sử dụng Clerk để xác thực

Hỗ trợ đăng nhập qua Google, GitHub, Email

2. Đăng ký tình nguyện viên
Sinh viên CNTT đăng ký với thông tin:

Họ tên, SĐT, Email, Địa chỉ

Trường học, Chuyên ngành

Kỹ năng, Kinh nghiệm

Lĩnh vực hỗ trợ (Smartphone, Máy tính, Bảo mật, Office)

Hình thức hỗ trợ (Online, Trực tiếp)

Thời gian rảnh

3. Tạo yêu cầu hỗ trợ
Người dùng tạo yêu cầu với các thông tin:

Loại hỗ trợ

Mô tả vấn đề

Mức độ ưu tiên

Ngày giờ mong muốn

Hình thức hỗ trợ

Có thể chọn TNV ưu tiên

4. Dashboard tình nguyện viên
Xem danh sách yêu cầu mới

Nhận yêu cầu hỗ trợ

Quản lý các yêu cầu đang xử lý

Xem lịch sử đã hoàn thành

5. Chat realtime
Trò chuyện 1-1 giữa User và TNV

Gửi ảnh và video (hỗ trợ nén ảnh)

Đánh dấu đã đọc

Hiển thị trạng thái đang nhập

Thông báo tin nhắn mới

Gọi thoại (WebRTC)

6. Đánh giá
User đánh giá TNV sau khi hoàn thành

Đánh giá hệ thống (bắt buộc sau 3 đơn)

Lưu đánh giá vào Google Sheet (khảo sát)

7. Quản lý tài liệu
TNV đăng bài viết hướng dẫn

Phân loại theo danh mục

Báo cáo bài viết không phù hợp

Tự động ẩn bài viết sau 3 báo cáo

Đánh giá hữu ích

8. Thông báo realtime
Tin nhắn mới

Yêu cầu mới

TNV tiếp nhận yêu cầu

Hoàn thành yêu cầu

Bài viết mới / bị báo cáo

Dừng hỗ trợ

Luồng hoạt động
User tạo yêu cầu hỗ trợ
↓
Yêu cầu vào danh sách pending
↓
TNV nhận yêu cầu (status: accepted)
↓
User và TNV chat realtime (status: in-progress)
↓
TNV yêu cầu hoàn thành (status: pending_complete)
↓
User xác nhận hoàn thành (status: completed)
↓
User đánh giá TNV (status: reviewed)
↓
Hoàn tất

Trạng thái yêu cầu hỗ trợ
pending : Chờ TNV nhận
accepted : TNV đã nhận
in-progress : Đang xử lý
pending_complete : Chờ user xác nhận hoàn thành
completed : Hoàn thành, chờ đánh giá
reviewed : Đã đánh giá
cancelled : Đã hủy

Cấu trúc thư mục
Backend
techshare-server/
├── src/
│ ├── config/ # Cấu hình Cloudinary, database
│ ├── controllers/ # Xử lý logic
│ ├── models/ # Mongoose models
│ ├── routes/ # API routes
│ └── middleware/ # Xác thực, phân quyền
├── uploads/ # File upload tạm
├── socket.js # Socket.IO server
├── server.js # Entry point
└── package.json

Frontend
techshare-client/
├── app/
│ ├── (auth)/ # Đăng nhập/đăng ký
│ ├── api/ # Next.js API routes
│ ├── chat/[id]/ # Trang chat
│ ├── messages/ # Danh sách tin nhắn
│ ├── my-requests/ # Lịch sử yêu cầu
│ ├── RequestAssistance/ # Tạo yêu cầu
│ ├── services/ # API services
│ ├── tai-nguyen/ # Thư viện tài liệu
│ ├── tinh-nguyen-vien/ # Quản lý bài viết
│ └── volunteer-*/ # Đăng ký, hồ sơ, dashboard
├── components/ # React components
├── public/ # Static files
└── package.json

Các trang chính
Trang chủ : / - Giới thiệu nền tảng
Đăng ký TNV : /volunteer-registration - Form đăng ký tình nguyện viên
Dashboard TNV : /volunteer-dashboard - Quản lý yêu cầu
Tạo yêu cầu : /RequestAssistance - Form tạo yêu cầu hỗ trợ
Yêu cầu của tôi : /my-requests - Lịch sử yêu cầu
Danh sách TNV : /danh-sach-tinh-nguyen-vien - Tìm kiếm TNV
Tài liệu TechShare : /tai-nguyen - Thư viện bài viết
Chi tiết bài viết : /tai-nguyen/[id] - Xem nội dung bài viết
Tin nhắn : /messages - Danh sách cuộc trò chuyện
Chat : /chat/[id] - Chat realtime
Hồ sơ TNV : /volunteer-profile - Quản lý thông tin cá nhân
Quản lý bài viết : /tinh-nguyen-vien/bai-viet - CRUD bài viết
Đánh giá TNV : /rate-request/[id] - Đánh giá sau khi hoàn thành

API Endpoints
Volunteers
GET /api/volunteers Lấy danh sách TNV
POST /api/volunteers Đăng ký TNV
GET /api/volunteers/check/:clerkId Kiểm tra trạng thái đăng ký
GET /api/volunteers/:id/reviews Lấy đánh giá của TNV
PATCH /api/volunteers/:id Cập nhật hồ sơ

Support Requests
POST /api/requests Tạo yêu cầu
GET /api/requests/user/:clerkId Lấy yêu cầu của user
GET /api/requests/pending Lấy yêu cầu pending
GET /api/requests/check/:clerkId Kiểm tra cần đánh giá hệ thống
PATCH /api/requests/:id/accept TNV nhận yêu cầu
PATCH /api/requests/:id/status Cập nhật trạng thái
PATCH /api/requests/:id/request-complete TNV yêu cầu hoàn thành
PATCH /api/requests/:id/confirm-complete User xác nhận hoàn thành
PATCH /api/requests/:id/reject-complete User yêu cầu hỗ trợ thêm
PATCH /api/requests/:id/rate User đánh giá TNV
PATCH /api/requests/:id/rate-system User đánh giá hệ thống
PATCH /api/requests/:id/stop-support TNV dừng hỗ trợ

Resources (Bài viết)
GET /api/resources Lấy danh sách bài viết
GET /api/resources/my Lấy bài viết của tôi
GET /api/resources/:id Lấy chi tiết bài viết
POST /api/resources Đăng bài mới
PUT /api/resources/:id Cập nhật bài viết
DELETE /api/resources/:id Xóa bài viết
PATCH /api/resources/:id/helpful Đánh giá hữu ích
POST /api/resources/:id/reports Báo cáo bài viết
GET /api/resources/:id/reports Lấy báo cáo bài viết

Chat
GET /api/chat/conversations Lấy danh sách cuộc trò chuyện
GET /api/chat/:requestId/messages Lấy tin nhắn
POST /api/chat/:requestId/messages Gửi tin nhắn text
POST /api/chat/:requestId/messages/media Gửi tin nhắn có ảnh/video
PATCH /api/chat/:requestId/read Đánh dấu đã đọc

Reviews
GET /api/reviews Lấy danh sách đánh giá
POST /api/reviews Tạo đánh giá
GET /api/reviews/volunteer/:volunteerId Lấy đánh giá theo TNV

Surveys
POST /api/surveys Lưu đánh giá hệ thống
GET /api/surveys Lấy danh sách khảo sát

Database Models
Volunteer

Thông tin cá nhân (fullName, phone, email, address)

Học vấn (university, major)

Kỹ năng và kinh nghiệm (skills, experience)

Lĩnh vực hỗ trợ (supportType, otherSupportDesc)

Hình thức hỗ trợ (inPerson, online)

Thống kê (totalSupported, rating, avatarUrl)

SupportRequest

Thông tin yêu cầu (supportType, description, urgency)

Thời gian (supportDate, timeSlot)

Hình thức hỗ trợ (inPerson, online)

Trạng thái (status)

TNV được phân công (volunteerId, volunteerName)

TNV được ưu tiên (preferredVolunteerId, preferredVolunteerName)

Đánh giá TNV (rating, ratingComment)

Đánh giá hệ thống (systemRating, systemComment, systemRated)

Message

Nội dung tin nhắn (text)

Media (mediaUrl, mediaType)

Người gửi (senderId, senderName, senderType)

Trạng thái đã đọc (read)

Resource

Bài viết (title, description, content)

Danh mục (category)

Tác giả (author, authorId)

Tương tác (helpfulCount, viewCount)

Báo cáo (reportCount, isHidden, hiddenReason)

Review

Đánh giá TNV (rating, comment)

Người đánh giá (clerkId, userName, userEmail)

Request liên quan (requestId)

Survey

Đánh giá hệ thống (rating, comment)

Người đánh giá (clerkId, fullName, email)

Thời gian đánh giá

Report

Báo cáo bài viết (resourceId, reporterId)

Lý do báo cáo (reason, reasonDetail)

Trạng thái xử lý (status)

Socket.IO Events
Client gửi

join-room : Tham gia phòng chat

leave-room : Rời phòng chat

send-message : Gửi tin nhắn

typing : Đang nhập

voice-call-offer : Khởi tạo cuộc gọi thoại

voice-call-answer : Trả lời cuộc gọi

voice-call-ice-candidate: Trao đổi ICE candidate

Server gửi

receive-message : Nhận tin nhắn mới

user-typing : User đang nhập

notification : Thông báo

voice-call-offer : Nhận offer gọi

voice-call-answer : Nhận answer

voice-call-ice-candidate: Nhận ICE candidate

Tính năng bảo mật
Xác thực qua Clerk, không lưu mật khẩu

Phân quyền User và TNV riêng biệt

Chỉ TNV mới được nhận yêu cầu hỗ trợ

Chỉ tác giả mới được sửa/xóa bài viết của mình

Báo cáo bài viết: 3 báo cáo = tự động ẩn

Xác thực 2 bước khi hoàn thành yêu cầu

Chỉ người gửi mới xóa được tin nhắn của mình

Tối ưu hiệu suất
Nén ảnh trước khi upload (browser-image-compression)

Phân trang cho danh sách (6-10 item mỗi trang)

Polling 3 giây cho danh sách chat (có thể tùy chỉnh)

Socket.IO realtime cho tin nhắn

Lazy loading cho ảnh

Cache localStorage cho danh sách đã xóa

Tính năng đặc biệt
Gọi thoại WebRTC (Peer-to-peer)

Upload ảnh/video lên Cloudinary

QR Code cho thuyết trình

Responsive trên mọi thiết bị

Dark/Light mode (có thể mở rộng)

Xuất đánh giá ra Google Sheet

Tác giả
TechShare - Cộng đồng công nghệ Việt Nam
Email: techshare.bht.dev@gmail.com

Giấy phép
MIT License - Mã nguồn mở cho cộng đồng
