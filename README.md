# AI Bio Studio - Vercel Ready

Cau truc nay da duoc doi tu server Node truyen thong sang Vercel Functions.

## Thu muc
- `public/index.html`: frontend
- `api/health.js`: health check
- `api/generate.js`: goi OpenAI Responses API
- `lib/ai-bio-core.js`: logic dung chung

## Deploy len Vercel
1. Day source len GitHub.
2. Vao Vercel -> Add New -> Project.
3. Import repo.
4. Them environment variables:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` = `gpt-5-mini`
5. Deploy.

## Chay local bang Vercel CLI
```bash
npm install
npx vercel dev
```

## Luu y
- Frontend goi `/api/health` va `/api/generate` nen khong can sua `index.html`.
- `OPENAI_API_KEY` phai duoc dat tren Vercel Project Settings -> Environment Variables.
