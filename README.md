<div dir="rtl">

# 🎬 جستجوی فیلم و سریال

اپلیکیشن وب برای جستجوی فیلم و سریال با استفاده از API شرکت [TMDB (The Movie Database)](https://www.themoviedb.org/) — ساخته‌شده با **TanStack Start** و **React 19**.

🔗 **نسخه زنده:** [movie-search-lyart-seven.vercel.app](https://movie-search-lyart-seven.vercel.app/)

---

## ✨ امکانات

- جستجوی بلادرنگ فیلم و سریال با debounce 500ms
- نمایش اطلاعات کامل: تصویر پوستر، عنوان، نوع (فیلم/سریال)، سال انتشار و امتیاز IMDB
- پشتیبانی از زبان فارسی و چیدمان راست‌به‌چپ (RTL)
- اعتبارسنجی داده‌ها با Zod v4
- مدیریت خطا با Error Boundary و دکمه تلاش مجدد
- طراحی واکنش‌گرا (Responsive) با Tailwind CSS v4

---

## 🛠️ فناوری‌های استفاده‌شده

| دسته             | فناوری                                                                       |
| ---------------- | ---------------------------------------------------------------------------- |
| فریمورک          | [TanStack Start](https://tanstack.com/start) + [React 19](https://react.dev) |
| مسیریابی         | [TanStack Router](https://tanstack.com/router)                               |
| مدیریت داده سرور | [TanStack Query](https://tanstack.com/query)                                 |
| ساخت ابزار       | [Vite 8](https://vitejs.dev)                                                 |
| پکیج منیجر       | [Bun](https://bun.sh)                                                        |
| استایل           | [Tailwind CSS v4](https://tailwindcss.com)                                   |
| کامپوننت‌ها      | [shadcn/ui](https://ui.shadcn.com) (Radix UI)                                |
| اعتبارسنجی       | [Zod v4](https://zod.dev)                                                    |
| آیکون‌ها         | [Lucide React](https://lucide.dev)                                           |
| فونت             | [Vazirmatn](https://github.com/rastikerdar/vazirmatn)                        |
| استقرار          | [Vercel](https://vercel.com)                                                 |

---

## 📦 نصب و اجرا

### پیش‌نیازها

- [Bun](https://bun.sh) نسخه 1.0 یا بالاتر
- یک توکن دسترسی خواندنی از [TMDB](https://www.themoviedb.org/settings/api)

### مراحل راه‌اندازی

```bash
# 1. کلون کردن مخزن
git clone https://github.com/YOUR_USERNAME/movie-search.git
cd movie-search

# 2. نصب وابستگی‌ها
bun install

# 3. کپی کردن فایل محیطی و تنظیم توکن TMDB
cp .env.example .env
```

سپس فایل `.env` را ویرایش کنید و توکن خود را قرار دهید:

```
THEMOVIEDB_READ_ACCESS_TOKEN=your_tmdb_token_here
```

```bash
# 4. اجرای سرور توسعه
bun run dev
```

برنامه روی `http://localhost:5000` اجرا خواهد شد.

---

## 📜 دستورات مفید

| دستور                     | توضیح                             |
| ------------------------- | --------------------------------- |
| `bun run dev`             | اجرای سرور توسعه (پورت 5000)      |
| `bun run build`           | ساخت نسخه producción              |
| `bun run preview`         | پیش‌نمایش نسخه producción         |
| `bun run lint`            | اجرای ESLint                      |
| `bun run format`          | قالب‌بندی کد با Prettier و ESLint |
| `bun run check`           | بررسی قالب‌بندی (مناسب CI)        |
| `bun run generate-routes` | بازسازی فایل درخت مسیرها          |

---

## 📁 ساختار پروژه

```
movie-search/
├── public/                          # فایل‌های استاتیک
├── src/
│   ├── components/
│   │   ├── search-movie-tvseries.tsx  # کامپوننت اصلی جستجو
│   │   ├── custom-card.tsx            # کامپوننت کارت سفارشی
│   │   ├── imdb-icon.tsx              # آیکون IMDB
│   │   └── ui/                        # کامپوننت‌های رابط کاربری (shadcn/ui)
│   ├── routes/
│   │   ├── __root.tsx                 # لایوت اصلی (HTML + RTL + فونت)
│   │   └── index.tsx                  # صفحه اصلی
│   ├── serverfn/
│   │   └── movie-tvseries.ts        # تابع سرور: فراخوانی API شرکت TMDB
│   ├── zod-schema/
│   │   └── movie-tvseries-search-result.ts  # اسکیمای Zod برای اعتبارسنجی پاسخ
│   ├── lib/
│   │   ├── env.server.ts             # اعتبارسنجی متغیرهای محیطی
│   │   └── utils.ts                  # ابزارهای کمکی
│   ├── integrations/                 # یکپارچه‌سازی TanStack Query
│   └── font/
│       └── vazirmatn/                # فونت وزیرمتن
├── .env.example                     # الگوی متغیرهای محیطی
├── components.json                  # پیکربندی shadcn/ui
├── package.json
└── tsconfig.json
```

---

## 🔑 متغیرهای محیطی

| متغیر                          | توضیح                     | محل استفاده                             |
| ------------------------------ | ------------------------- | --------------------------------------- |
| `THEMOVIEDB_READ_ACCESS_TOKEN` | توکن دسترسی API شرکت TMDB | سمت سرور (هرگز به کلاینت ارسال نمی‌شود) |

> ⚠️ توکن TMDB فقط در سمت سرور استفاده می‌شود و هیچ‌گاه در مرورگر کاربر قرار نمی‌گیرد.

برای دریافت توکن، به [صفحه تنظیمات API شرکت TMDB](https://www.themoviedb.org/settings/api) مراجعه کنید.

---

## 🚀 استقرار

این پروژه روی **Vercel** مستقر شده است. برای استقرار خودکار کافی است مخزن را به Vercel متصل کنید و متغیر `THEMOVIEDB_READ_ACCESS_TOKEN` را در بخش تنظیمات Environment Variables پنل Vercel اضافه کنید.

---

## 📄 مجوز

این پروژه تحت مجوز MIT منتشر شده است.

</div>
