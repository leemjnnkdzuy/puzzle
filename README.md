# Puzzle

Du an ung dung web ho tro tao script va quan ly video, bao gom Frontend, Backend va Extension.

## Tong quan

Puzzle la mot nen tang cho phep nguoi dung quan ly cac du an tao script, upload va quan ly video, cung nhu xem video truc tiep tren nen tang. He thong tich hop xac thuc nguoi dung, quan ly luu tru va thanh toan.

## Cau truc du an

Du an duoc chia thanh cac thu muc chinh:

-   frontend/: Ung dung web phia may khach (React + Vite).
-   backend/: API Server (Node.js + Express).
-   extension/: Tien ich mo rong trinh duyet.

## Cong nghe su dung

### Frontend

-   React 19
-   TypeScript
-   Vite
-   Tailwind CSS
-   Zustand (Quan ly trang thai)
-   Lucide React (Icon)
-   Axios (HTTP Client)

### Backend

-   Node.js
-   Express
-   MongoDB (Mongoose)
-   TypeScript
-   JWT (Xac thuc)
-   FFmpeg (Xu ly video)
-   PayOS (Thanh toan)

## Huong dan Cai dat va Chay du an

### Yeu cau tien quyet

-   Node.js (v18 tro len)
-   MongoDB

### 1. Khoi chay Backend

Di chuyen vao thu muc backend:

cd backend

Cai dat cac goi phu thuoc:

npm install

Cau hinh moi truong (tao file .env neu can thiet) va khoi chay server:

npm run dev

### 2. Khoi chay Frontend

Di chuyen vao thu muc frontend:

cd frontend

Cai dat cac goi phu thuoc:

npm install

Khoi chay ung dung:

npm run dev

### 3. Extension

De cai dat extension:

1. Mo trinh duyet (Chrome/Edge).
2. Truy cap trang quan ly Extension (chrome://extensions).
3. Bat "Developer mode" (Che do danh cho nha phat trien).
4. Chon "Load unpacked" va chon thu muc extension.

## Tinh nang chinh

-   He thong User: Dang ky, Dang nhap, Quan ly Profile.
-   Quan ly Du an: Tao va quan ly du an Script Generation.
-   Video:
    -   Upload video (ho tro keo tha).
    -   Tu dong tao thumbnail tu video.
    -   Video Player tuy chinh (Play/Pause, Seek, Speed, Volume).
    -   Quan ly danh sach video (Sap xep, Xoa).
-   Luu tru: Hien thi dung luong da dung/con lai, nang cap goi luu tru.
