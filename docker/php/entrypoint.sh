#!/usr/bin/env bash
set -euo pipefail

PHP_USER=www-data
APP_DIR=/var/www

cd "$APP_DIR"

echo "▶ Ensuring var/ folders & permissions…"
mkdir -p var/cache var/log
chown -R ${PHP_USER}:${PHP_USER} var || true
chmod -R ug+rwX var || true

# إذا لا يوجد vendor، ثبّت الحزم
if [ ! -d "vendor" ]; then
  echo "▶ Running composer install (first boot)…"
  su -s /bin/sh -c "composer install --no-interaction --prefer-dist --no-progress" ${PHP_USER}
else
  echo "✔ vendor/ already present."
fi

# تأكد من وجود مفاتيح JWT إن كان المشروع يستخدم lexik/jwt-authentication-bundle
if [ -f "bin/console" ]; then
  if su -s /bin/sh -c "php bin/console list lexik:jwt --raw >/dev/null 2>&1" ${PHP_USER}; then
    echo "▶ Generating JWT keypair (if missing)…"
    su -s /bin/sh -c "php bin/console lexik:jwt:generate-keypair --skip-if-exists" ${PHP_USER}
  fi
fi

# انتظر قاعدة البيانات (لو لم تكفِ depends_on:healthy)
echo "▶ Waiting DB tcp connection on db:3306…"
for i in $(seq 1 30); do
  if php -r 'try{$dbh=new PDO("mysql:host=db;port=3306","root","root");echo "ok\n";}catch(Throwable $e){exit(1);}'; then
    break
  fi
  sleep 2
done

# ترحيلات قاعدة البيانات (لا تتسبب بالفشل إن لم توجد)
if [ -f "bin/console" ]; then
  echo "▶ cache:clear (dev)…"
  su -s /bin/sh -c "php bin/console cache:clear --no-interaction" ${PHP_USER} || true

  echo "▶ doctrine:migrations:migrate …"
  su -s /bin/sh -c "php bin/console doctrine:migrations:migrate --no-interaction" ${PHP_USER} || true
fi

echo "✔ PHP-FPM is starting…"
exec "$@"
