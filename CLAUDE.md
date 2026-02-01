# Claude Code - Financial Tracker Project

Bu dosya Claude Code'un projede nasil calisacagini ve hangi skill'leri kullanacagini tanimlar.

## Proje Ozeti

Personal Finance Tracking uygulamasi - React + TypeScript (Frontend), Express + Node.js (Backend), Supabase (Database).

**Monorepo Yapisi:**
- `frontend/` - React + Vite uygulamasi
- `backend/` - Express API servisi
- Her ikisi ayri Vercel projesi olarak deploy edilir

## Gelistirme Komutlari

```bash
npm install          # Bagimliliklari yukle
npm run dev          # Frontend + Backend birlikte calistir
npm run dev:fe       # Sadece frontend (port 5173)
npm run dev:be       # Sadece backend (port 3001)
npm run build        # Tum projeyi build et
```

---

## SKILL: create-pr

**ONEMLI: Bu skill, bir task tamamlandiginda OTOMATIK olarak tetiklenir.**

### Ne Zaman Tetiklenir?

Bu skill asagidaki durumlarda MUTLAKA calistirilmalidir:

1. Kullanici bir "task", "ozellik", "feature", "fix", "duzeltme" istediginde VE bu istek tamamlandiginda
2. Kodda degisiklik yapildiktan sonra
3. Kullanici acikca "PR olustur", "pull request yap" dediginde
4. Bir gelistirme gorevi basariyla tamamlandiginda

### Tetikleme Kosullari

Task tamamlandiginda asagidaki adimlar OTOMATIK olarak yapilir:

1. **Degisiklik Kontrolu**: `git status` ile degisiklik var mi kontrol et
2. **Commit**: Tum degisiklikleri uygun commit mesaji ile commit et
3. **Push**: Branch'i remote'a push et
4. **PR Olustur**: `gh pr create` ile PR olustur

### Commit Convention

```
<type>: <aciklama>
```

**Tipler:**
- `feat` - Yeni ozellik
- `fix` - Bug duzeltme
- `hotfix` - Acil production fix
- `refactor` - Kod refactoring
- `docs` - Dokumantasyon
- `style` - Formatting, styling
- `test` - Test ekleme/duzeltme
- `chore` - Build, config degisiklikleri

### PR Template

PR olusturulurken su format kullanilir:

```markdown
## Summary
- Yapilan degisikliklerin kisa ozeti (bullet points)

## Changes
- Detayli degisiklik listesi

## Test Plan
- [ ] Test adimlari
```

### Ornek Workflow

```bash
# 1. Degisiklikleri kontrol et
git status

# 2. Degisiklikleri stage et
git add <dosyalar>

# 3. Commit at
git commit -m "feat: yeni ozellik eklendi"

# 4. Push et
git push -u origin <branch-name>

# 5. PR olustur
gh pr create --title "feat: yeni ozellik" --body "## Summary..."
```

---

## SKILL: local-development

### Test Endpoints
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001/api/health`

### Backend Serverless Function Yapisi

Backend'de `api/index.ts` serverless function olarak calisir:

```typescript
import express from 'express';
import cors from 'cors';

const app = express();
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

export default app;
```

---

## SKILL: vercel-deployment

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

### Environment Variables

**Frontend:**
- `VITE_API_URL` - Backend API URL'i

**Backend:**
- `ALLOWED_ORIGINS` - CORS icin izinli origin'ler (virgul ile ayrilmis)
- `PORT` - Sunucu portu (varsayilan: 3001)

---

## SKILL: troubleshooting

### Yaygin Hatalar

| Hata | Cozum |
|------|-------|
| `No Output Directory named "dist" found` | `outputDirectory` dogru ayarla |
| CORS hatasi | `ALLOWED_ORIGINS` env var'i guncelle |
| Build hatasi | `npm run build` ile lokal test et |

### Cache Temizleme
Vercel'de: **Deployments** > **Redeploy** > "Clear Build Cache"

---

## Onemli Kurallar

1. **Her task sonunda PR olustur**: Bir gelistirme gorevi tamamlandiginda MUTLAKA PR olusturma sureci baslatilmalidir.

2. **Commit mesajlari**: Turkce veya Ingilizce olabilir, tutarli ol.

3. **Branch isimlendirme**: Mevcut branch uzerinde calis veya `claude/` prefix'i ile yeni branch olustur.

4. **Test**: Degisikliklerden sonra `npm run build` ile build'in calistigini dogrula.
