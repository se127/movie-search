<div dir="rtl">

# 🎬 جستجوی فیلم و سریال

اپلیکیشن وب برای جستجوی فیلم و سریال — ساخته‌شده با **TanStack Start** و **React 19**.

داده‌ها از دیتاست عمومی **TMDB Movies and Series** (Kaggle) وارد **PostgreSQL** می‌شوند و جستجو توسط موتور جستجوی **Typesense** انجام می‌شود.

---

## ✨ امکانات

- جستجوی بلادرنگ فیلم و سریال با debounce 500ms
- موتور جستجوی **Typesense** با جستجوی تمام‌متن، تحمل غلط املایی (Typo Tolerance) و جستجوی پیشوندی (Prefix)
- رتبه‌بندی نتایج بر اساس تطابق متن، سپس محبوبیت و سپس سال انتشار (جدیدترین‌ها) — مطابق `_text_match:desc, popularity:desc, release_date_ts:desc`
- صفحه‌بندی نتایج جستجو (صفحه، اندازه صفحه و کل صفحات)
- نمایش اطلاعات کامل: تصویر پوستر، عنوان، نوع (فیلم/سریال)، سال انتشار و امتیاز کاربران TMDB
- نمایش امتیاز با آیکون ستاره و راهنمای Tooltip
- بستن نتایج جستجو با کلیک در خارج از کادر جستجو
- دکمه «مشاهده همه نتایج» هنگام وجود چند صفحه نتیجه
- نتایج قابل کلیک با افکت hover
- اسکرول‌بار سفارشی با ScrollArea
- پشتیبانی از زبان فارسی و چیدمان راست‌به‌چپ (RTL)
- مدیریت خطا با Error Boundary و دکمه تلاش مجدد
- طراحی واکنش‌گرا (Responsive) با Tailwind CSS v4

---

## 🛠️ فناوری‌های استفاده‌شده

| دسته             | فناوری                                                                             |
| ---------------- | ---------------------------------------------------------------------------------- |
| فریمورک          | [TanStack Start](https://tanstack.com/start) + [React 19](https://react.dev)       |
| مسیریابی         | [TanStack Router](https://tanstack.com/router)                                     |
| مدیریت داده سرور | [TanStack Query](https://tanstack.com/query)                                       |
| پایگاه‌داده      | [PostgreSQL](https://www.postgresql.org) + [Drizzle ORM](https://orm.drizzle.team) |
| موتور جستجو      | [Typesense](https://typesense.org)                                                 |
| ساخت ابزار       | [Vite 8](https://vitejs.dev)                                                       |
| پکیج منیجر       | [Bun](https://bun.sh)                                                              |
| استایل           | [Tailwind CSS v4](https://tailwindcss.com)                                         |
| کامپوننت‌ها      | [shadcn/ui](https://ui.shadcn.com) (Radix UI)                                      |
| آیکون‌ها         | [Lucide React](https://lucide.dev)                                                 |
| فونت             | [Vazirmatn](https://github.com/rastikerdar/vazirmatn)                              |

---

## 📦 نصب و اجرا

### پیش‌نیازها

- [Bun](https://bun.sh) نسخه 1.0 یا بالاتر
- یک سرور [PostgreSQL](https://www.postgresql.org/download/) فعال
- یک سرور [Typesense](https://typesense.org/docs/guide/install-typesense.html) فعال (پیش‌فرض روی پورت 8108)
- دیتاست **TMDB Movies and Series** از کگل (Kaggle)

### گام ۱: دانلود دیتاست

از آدرس زیر دیتاست را دانلود کنید:

🔗 **[TMDB Movies and Series — Kaggle](https://www.kaggle.com/datasets/edgartanaka1/tmdb-movies-and-series)**

پس از دانلود، فایل ZIP را در **ریشه (Root) پروژه** خارج کنید تا ساختار زیر ایجاد شود:

```
movie-search/
└── dataset/
    └── tmdb-data/
        ├── movies/
        │   └── movies/
        │       ├── *.json
        │       └── ...
        └── series/
            └── series/
                ├── *.json
                └── ...
```

> 📌 فایل‌های JSON هر فیلم و سریال به‌صورت جداگانه در این پوشه‌ها قرار دارند و اسکریپت Seed آن‌ها را می‌خواند.

### گام ۲: راه‌اندازی پروژه

```bash
# 1. کلون کردن مخزن
git clone https://github.com/YOUR_USERNAME/movie-search.git
cd movie-search

# 2. نصب وابستگی‌ها
bun install

# 3. کپی کردن فایل محیطی
cp .env.example .env
```

### گام ۳: تنظیم پایگاه‌داده

فایل `.env` را ویرایش کنید و آدرس اتصال PostgreSQL خود را قرار دهید:

```
DATABASE_URL="postgresql://username:password@localhost:5432/movie_search_db"
```

سپس پایگاه‌داده را ایجاد کنید:

```sql
CREATE DATABASE movie_search_db;
```

### گام ۴: راه‌اندازی Typesense

فایل `.env` را با تنظیمات سرور Typesense خود تکمیل کنید:

```
TYPESENSE_API_KEY=xyz
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
```

ساده‌ترین راه برای اجرای Typesense استفاده از Docker است:

```bash
docker run -p 8108:8108 -v /tmp/typesense-data:/data \
  typesense/typesense:latest \
  --data-dir /data --api-key=xyz --enable-cors
```

> 📌 اگر از Docker استفاده نمی‌کنید، می‌توانید Typesense را به‌صورت مستقیم از [راهنمای نصب رسمی](https://typesense.org/docs/guide/install-typesense.html) نصب کنید. مقدار `api-key` باید با `TYPESENSE_API_KEY` در فایل `.env` یکی باشد.

### گام ۵: اجرای Schema و Seed

ابتدا ساختار جدول‌ها را در پایگاه‌داده ایجاد کنید:

```bash
# اعمال اسکیما روی پایگاه‌داده
bun run db:push
```

سپس داده‌ها را از پوشه `dataset` وارد کنید. این دستور ابتدا مجموعه (Collection) `movie_tvseries` را در Typesense می‌سازد و داده‌ها را هم در PostgreSQL و هم در Typesense وارد می‌کند:

```bash
# وارد کردن فیلم‌ها و سریال‌ها (همزمان در PostgreSQL و Typesense)
bun run db:seed
```

> 💡 می‌توانید فقط فیلم‌ها (`bun run db:seed -- --movies-only`) یا فقط سریال‌ها (`bun run db:seed -- --series-only`) را وارد کنید. هر بار اجرای Seed، جدول PostgreSQL و مجموعه Typesense پاک و از نو ساخته می‌شوند.

### گام ۶: اجرای سرور توسعه

```bash
bun run dev
```

برنامه روی `http://localhost:5000` اجرا خواهد شد.

---

## 📜 دستورات مفید

| دستور                     | توضیح                                       |
| ------------------------- | ------------------------------------------- |
| `bun run dev`             | اجرای سرور توسعه (پورت 5000)                |
| `bun run build`           | ساخت نسخه producción                        |
| `bun run preview`         | پیش‌نمایش نسخه producción                   |
| `bun run lint`            | اجرای ESLint                                |
| `bun run format`          | قالب‌بندی کد با Prettier و ESLint           |
| `bun run check`           | بررسی قالب‌بندی (مناسب CI)                  |
| `bun run generate-routes` | بازسازی فایل درخت مسیرها                    |
| `bun run db:generate`     | تولید فایل‌های Migration (Drizzle)          |
| `bun run db:migrate`      | اجرای Migration‌ها                          |
| `bun run db:push`         | اعمال مستقیم اسکیما روی پایگاه‌داده         |
| `bun run db:seed`         | وارد کردن داده‌ها در PostgreSQL و Typesense |
| `bun run db:studio`       | باز کردن رابط گرافیکی Drizzle Studio        |

---

## 📁 ساختار پروژه

```
movie-search/
├── dataset/                        # دیتاست TMDB (از Kaggle، دستی اضافه می‌شود)
│   └── tmdb-data/
│       ├── movies/movies/          # فایل‌های JSON فیلم‌ها
│       └── series/series/          # فایل‌های JSON سریال‌ها
├── drizzle/                        # فایل‌های Migration
├── public/                         # فایل‌های استاتیک
├── src/
│   ├── components/
│   │   ├── search-movie-tvseries.tsx  # کامپوننت اصلی جستجو
│   │   ├── custom-card.tsx           # کامپوننت کارت سفارشی
│   │   ├── imdb-icon.tsx             # آیکون IMDB
│   │   └── ui/                       # کامپوننت‌های رابط کاربری (shadcn/ui)
│   │       ├── button.tsx            # دکمه
│   │       ├── card.tsx              # کارت
│   │       ├── avatar.tsx            # آواتار
│   │       ├── input.tsx             # ورودی متن
│   │       ├── input-group.tsx       # گروه ورودی
│   │       ├── textarea.tsx          # متن چندخطی
│   │       ├── scroll-area.tsx       # ناحیه اسکرول
│   │       ├── tooltip.tsx           # راهنمای Tooltip
│   │       └── direction.tsx         # تنظیم جهت RTL
│   ├── routes/
│   │   ├── __root.tsx                # لایوت اصلی (HTML + RTL + فونت)
│   │   └── index.tsx                 # صفحه اصلی
│   ├── serverfn/
│   │   └── search-movie-tvseries.ts  # تابع سرور: جستجو در Typesense
│   ├── typesense/
│   │   ├── client.server.ts          # کلاینت Typesense (singleton)
│   │   ├── schema.ts                 # اسکیمای مجموعه movie_tvseries
│   │   └── types.ts                  # تایپ‌های TypeScript سند
│   ├── db/
│   │   ├── index.ts                  # اتصال به پایگاه‌داده (singleton)
│   │   ├── relations.ts              # تعریف روابط جدول‌ها
│   │   ├── seed.ts                   # اسکریپت وارد کردن دیتاست TMDB به PostgreSQL و Typesense
│   │   └── schema/
│   │       ├── schema.ts             # خروجی‌های اسکیما
│   │       └── movie-tvseries-schema.ts  # جدول movie_tvseries
│   ├── lib/
│   │   ├── env.server.ts             # اعتبارسنجی متغیرهای محیطی
│   │   └── utils.ts                  # ابزارهای کمکی
│   ├── integrations/                 # یکپارچه‌سازی TanStack Query
│   └── font/
│       └── vazirmatn/                # فونت وزیرمتن
├── .env.example                     # الگوی متغیرهای محیطی
├── drizzle.config.ts                # پیکربندی Drizzle
├── components.json                  # پیکربندی shadcn/ui
├── package.json
└── tsconfig.json
```

---

## 🔑 متغیرهای محیطی

| متغیر                | توضیح                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------- |
| `DATABASE_URL`       | آدرس اتصال PostgreSQL (مثال: `postgresql://user:pass@localhost:5432/movie_search_db`) |
| `TYPESENSE_API_KEY`  | کلید API سرور Typesense (باید با `api-key` هنگام اجرای سرور یکی باشد)                 |
| `TYPESENSE_HOST`     | آدرس هاست Typesense (مثال: `localhost`)                                               |
| `TYPESENSE_PORT`     | پورت سرور Typesense (پیش‌فرض: `8108`)                                                 |
| `TYPESENSE_PROTOCOL` | پروتکل اتصال به Typesense: `http` یا `https`                                          |

---

## 📄 مجوز

این پروژه تحت مجوز MIT منتشر شده است.

</div>
