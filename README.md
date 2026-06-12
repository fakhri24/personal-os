# Personal OS

Dashboard manajemen personal berbasis web — Supabase backend, vanilla HTML5/CSS3/JavaScript frontend.

## Fitur

- **Ideas Brainstorm** — catat + kategorikan ide
- **Clothes Tracker** — lacak status pakaian (Bersih/Dipakai/Cuci/Jemur)
- **Learning Reminders** — spaced repetition untuk topik belajar (Nahwu, Shorof, Math, dll)
- **Package Tracker** — lacak resi pengiriman (JNE, J&T, SiCepat, dll)
- **Local Files Index** — index file lokal yang sudah diorganisir
- **Finance Tracker** — catat pemasukan & pengeluaran (format Rupiah)
- **Realtime** — auto-refresh via Supabase Realtime subscription

## Tech Stack

- Frontend: Vanilla HTML5, CSS3, JavaScript (ES6+)
- Backend: Supabase (PostgreSQL)
- Math rendering: KaTeX CDN
- Zero npm dependencies — semua via CDN

## Struktur

```
personal-os/
├── index.html              # Entry point
├── css/
│   └── style.css           # Dark theme design system
├── js/
│   ├── supabase-client.js  # Supabase connection + CRUD helpers
│   ├── utils.js            # Shared utilities (escapeHtml, formatCurrency, dll)
│   ├── app.js              # Main app logic (nav, modal, dashboard, toast)
│   └── tables/
│       ├── ideas-brainstorm.js
│       ├── clothes-tracker.js
│       ├── learning-reminders.js
│       ├── package-tracker.js
│       ├── local-files-index.js
│       └── finance-tracker.js
├── sql/
│   ├── setup-schema.sql    # 5 tabel awal + RLS policies
│   └── finance_tracker.sql # Finance table + grants
└── .hermes/                # Hermes Agent project config (auto-generated)
```

## Setup

### 1. Supabase

1. Buat project di [supabase.com](https://supabase.com)
2. Jalankan `sql/setup-schema.sql` dan `sql/finance_tracker.sql` di SQL Editor
3. Copy URL dan publishable key

### 2. Config

Buka `js/supabase-client.js`, update:

```js
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_KEY = 'sb_publishable_YOUR_KEY';
```

### 3. Run

Buka `index.html` langsung di browser (no build step).

Atau serve dengan:

```bash
python3 -m http.server 8080
# buka http://localhost:8080
```

## Konvensi

- Bahasa Indonesia untuk chat/UI, English untuk code
- Format Rupiah: `Rp100.000` (tanpa spasi, titik separator ribuan)
- Date format: `id-ID` locale
- CSS variables di `:root` — jangan hardcode warna
- Setiap table module punya: `name`, `displayName`, `columns[]`, `renderRow()`, `getDefaultValues()`

## Automations (via Hermes Agent)

- **YouTube Agadmator Monitor** — cek video baru 2x/hari
- **Package Tracker** — cek status resi tiap 2 jam via BinderByte API

Lihat `~/.hermes/projects/personal-os/config.json` untuk config detail.
