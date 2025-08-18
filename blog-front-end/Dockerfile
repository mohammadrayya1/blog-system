FROM node:20-alpine

WORKDIR /app

# نسخ تعريفات الحزم أولاً للاستفادة من layer cache
COPY package*.json ./

# تثبيت الحزم
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# نسخ باقي المشروع
COPY . .

# EntryPoint يتأكد من الحزم عند التشغيل
COPY docker-entrypoint.sh /usr/local/bin/frontend-entrypoint.sh
RUN chmod +x /usr/local/bin/frontend-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/frontend-entrypoint.sh"]

# تشغيل Vite dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
