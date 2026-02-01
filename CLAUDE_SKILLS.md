# Claude Skills - Financial Tracker Project

Bu döküman, projede kullanılan kuralları ve deployment süreçlerini içerir.

---

## Skill: create-pr

### Branch Naming Convention
```
FINT-XXXX-<kısa-açıklama>
```
- `XXXX`: 0001'den başlayan artan numara (her task'ta 1 artar)
- Örnek: `FINT-0001-initial-setup`, `FINT-0002-add-auth`

### Commit Convention
```
<type>: <description>

[optional body]
```

**Types:**
| Type | Kullanım |
|------|----------|
| `feat` | Yeni özellik |
| `fix` | Bug düzeltme |
| `hotfix` | Acil production fix |
| `refactor` | Kod refactoring |
| `docs` | Dökümantasyon |
| `style` | Formatting, styling |
| `test` | Test ekleme/düzeltme |
| `chore` | Build, config değişiklikleri |

**Örnekler:**
```bash
feat: add user authentication
fix: resolve login redirect issue
hotfix: fix production payment bug
refactor: simplify API error handling
```

### PR Oluşturma
1. Değişiklikleri commit et
2. Branch'i push et
3. PR aç:
   ```
   https://github.com/<user>/<repo>/pull/new/<branch-name>
   ```

### PR Template
```markdown
## Summary
- Bullet point özet

## Changes
- Yapılan değişiklikler listesi

## Test Plan
- [ ] Test adımları
```

### Branch Auto-Delete
GitHub'da ayarla:
**Settings** → **General** → **Pull Requests** → ✅ "Automatically delete head branches"

---

## Skill: vercel-deployment

### Monorepo Yapısı (FE + BE Ayrı Deploy)

```
project/
├── frontend/          → Vercel Project 1
│   ├── vercel.json
│   └── ...
├── backend/           → Vercel Project 2
│   ├── api/
│   │   └── index.ts   → Serverless function
│   ├── vercel.json
│   └── ...
└── package.json
```

### Frontend vercel.json
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### Backend vercel.json
```json
{
  "version": 2,
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" }
  ]
}
```

### Backend Serverless Function (api/index.ts)
```typescript
import express from 'express';
import cors from 'cors';

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy' });
});

export default app;
```

### Vercel'de İki Proje Oluşturma

**1. Backend:**
| Ayar | Değer |
|------|-------|
| Project Name | `<project>-api` |
| Root Directory | `backend` |
| Framework | `Other` |
| Env: ALLOWED_ORIGINS | `https://<frontend-domain>` |

**2. Frontend:**
| Ayar | Değer |
|------|-------|
| Project Name | `<project>-fe` |
| Root Directory | `frontend` |
| Framework | `Vite` |
| Env: VITE_API_URL | `https://<backend-domain>` |

### Önemli Notlar
- ❌ `builds` array kullanma (legacy)
- ❌ `functions` ile runtime version belirtme
- ✅ Root Directory'yi doğru ayarla
- ✅ Tüm override'ları boş bırak, vercel.json'a güven
- ✅ CORS'u environment variable ile yönet

---

## Skill: custom-domain

### Subdomain Ekleme (Namecheap)

**DNS Ayarı:**
```
Type: CNAME
Name: <subdomain>
Value: cname.vercel-dns.com
TTL: Automatic
```

**Vercel'de:**
1. Project → Settings → Domains
2. `<subdomain>.<domain>.com` ekle
3. SSL otomatik ayarlanır

### Subdirectory vs Subdomain

| Yöntem | URL | Zorluk |
|--------|-----|--------|
| Subdomain | `app.domain.com` | Kolay ✓ |
| Subdirectory | `domain.com/app` | Zor (reverse proxy gerekir) |

**Öneri:** Subdomain kullan

### DNS Propagation Kontrolü
```
https://dnschecker.org/#CNAME/<subdomain>.<domain>.com
```

---

## Skill: environment-variables

### Frontend (.env)
```env
VITE_API_URL=https://api.example.com
```

**Kullanım:**
```typescript
const apiUrl = import.meta.env.VITE_API_URL || '';
```

### Backend (.env)
```env
PORT=3001
ALLOWED_ORIGINS=https://app.example.com,https://localhost:5173
```

**Kullanım:**
```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
```

### Vercel'de Env Variables
Project → Settings → Environment Variables
- Production, Preview, Development için ayrı ayrı ayarlanabilir

---

## Skill: vercel-troubleshooting

### Yaygın Hatalar ve Çözümleri

| Hata | Çözüm |
|------|-------|
| `No Output Directory named "dist" found` | `outputDirectory` doğru ayarla |
| `Missing script: "build:fe"` | `buildCommand` olarak `npm run build --workspace=frontend` kullan |
| `Function Runtimes must have valid version` | `functions` yerine `api/` klasör yapısı kullan |
| CORS hatası | `ALLOWED_ORIGINS` env var'ı güncelle |

### Cache Temizleme
Vercel'de: **Deployments** → **Redeploy** → ✅ "Clear Build Cache"

Veya env variable ekle:
```
VERCEL_FORCE_NO_BUILD_CACHE=1
```

---

## Skill: local-development

### Monorepo Komutları
```bash
# Tüm bağımlılıkları yükle
npm install

# Frontend geliştirme
npm run dev:fe

# Backend geliştirme
npm run dev:be

# Her ikisi birden
npm run dev

# Build
npm run build:fe
npm run build:be
```

### Test Endpoints
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001/api/health`

---

## Checklist: Yeni Özellik Ekleme

- [ ] Branch oluştur: `FINT-XXXX-<description>`
- [ ] Değişiklikleri yap
- [ ] Lokal test et
- [ ] Commit at: `feat: <description>`
- [ ] Push et
- [ ] PR oluştur
- [ ] PR'ı merge et
- [ ] Vercel deployment'ı kontrol et
- [ ] Production'da test et
