# Deployment — Google Drive Edition

1) GitHub: push this folder as a new repository (private).
2) Neon: create DB, copy connection string.
3) Google Cloud: create service account JSON; enable Drive API; share your Drive folder with that service account as Editor.
4) Vercel: New Project → import repo → Environment Variables:
   - NEXTAUTH_URL=https://yourapp.vercel.app
   - NEXTAUTH_SECRET=<long random>
   - DATABASE_URL=<your Neon string>
   - FILE_STORAGE_PROVIDER=gdrive
   - GDRIVE_FOLDER_ID=<folder id>
   - GDRIVE_SERVICE_ACCOUNT=<full JSON>  (or GDRIVE_KEY_BASE64=<base64>)
   - AI_PROVIDER=stub
   - FILE_RETENTION_DAYS=180
5) Build Command:
   `npx prisma generate && npx prisma db push && npx tsx scripts/seed.ts && next build`
6) Deploy. Then sign in as Admin and Client to test.
