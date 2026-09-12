# ==========================================
# Stage 1: Build & Compile TypeScript
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# کپی فایل‌های مدیریت وابستگی
COPY package*.json tsconfig.json ./

# نصب تمامی وابستگی‌ها برای بیلد گرفتن
RUN npm ci

# کپی سورس کد و کامپایل به جاوااسکریپت
COPY src ./src
RUN npm run build

# ==========================================
# Stage 2: Production Runtime
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# کپی وابستگی‌ها و نصب فقط پکیج‌های پروداکشن
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# کپی فایل‌های کامپایل شده از مرحله قبل
COPY --from=builder /app/dist ./dist

# اجرای ربات با کاربر غیر روت برای امنیت بیشتر (اختیاری ولی استاندارد)
USER node

# دستور اجرای پروژه
CMD ["node", "dist/index.js"]
