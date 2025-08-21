#!/usr/bin/env bash
set -euo pipefail

PHP_USER=www-data
APP_DIR=/var/www

cd "$APP_DIR"

echo "▶ Ensuring var/ folders & permissions…"
mkdir -p var/cache var/log
chown -R ${PHP_USER}:${PHP_USER} var || true
chmod -R ug+rwX var || true

# ✅ جهّز HOME قابل للكتابة لـ www-data (عشان ~/.symfony5 و كاش)
if [ ! -d "/home/www-data" ]; then
  mkdir -p /home/www-data
  chown -R ${PHP_USER}:${PHP_USER} /home/www-data
fi

# Composer install if vendor missing
if [ ! -d "vendor" ]; then
  echo "▶ Running composer install (first boot)…"
  su -s /bin/sh -c "composer install --no-interaction --prefer-dist --no-progress" ${PHP_USER}
else
  echo "✔ vendor/ already present."
fi

# Generate JWT keys if bundle is installed
if [ -f "bin/console" ]; then
  if su -s /bin/sh -c "php bin/console list lexik:jwt --raw >/dev/null 2>&1" ${PHP_USER}; then
    echo "▶ Generating JWT keypair (if missing)…"
    su -s /bin/sh -c "php bin/console lexik:jwt:generate-keypair --skip-if-exists" ${PHP_USER}
  fi
fi

# Wait for DB to be ready
echo "▶ Waiting DB tcp connection on db:3306…"
for i in $(seq 1 30); do
  if php -r 'try{$dbh=new PDO("mysql:host=db;port=3306","root","root");echo "ok\n";}catch(Throwable $e){exit(1);}'; then
    break
  fi
  sleep 2
done

# Locate init script (support multiple locations)
INIT_SCRIPT=""
for CAND in "bin/init.sh" "init.sh" "docker/php/init.sh"; do
  if [ -f "$CAND" ]; then
    INIT_SCRIPT="$CAND"
    break
  fi
done

# Symfony commands
if [ -f "bin/console" ]; then
  echo "▶ cache:clear (dev)…"
  su -s /bin/sh -c "php bin/console cache:clear --no-interaction" ${PHP_USER} || true

  if [ ! -f "var/.init_done" ] && [ -n "${INIT_SCRIPT}" ]; then
    echo "▶ Running ${INIT_SCRIPT} with Symfony CLI (first boot)…"
    sed -i 's/\r$//' "${INIT_SCRIPT}" || true

    if su -s /bin/bash -c "HOME=/home/www-data XDG_CACHE_HOME=/home/www-data/.cache PATH=/usr/local/bin:\$PATH bash '${INIT_SCRIPT}'" ${PHP_USER}; then
      touch var/.init_done
      echo "✔ init.sh completed successfully."
    else
      echo "✖ init.sh failed! (not marking var/.init_done)"
      exit 1
    fi
  else
    echo "▶ doctrine:migrations:migrate (Symfony CLI)…"
    su -s /bin/bash -c "HOME=/home/www-data XDG_CACHE_HOME=/home/www-data/.cache PATH=/usr/local/bin:\$PATH symfony console doctrine:migrations:migrate --no-interaction" ${PHP_USER} || true
  fi
fi

echo "✔ PHP-FPM is starting…"
exec "$@"
