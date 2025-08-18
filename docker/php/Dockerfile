FROM php:8.2-fpm

# نظام
RUN apt-get update && apt-get install -y \
    git unzip wget curl libzip-dev libicu-dev libonig-dev \
    libpng-dev libjpeg-dev libfreetype6-dev libxml2-dev \
    libxslt1.1 libxslt1-dev libpq-dev libssl-dev \
 && rm -rf /var/lib/apt/lists/*

# Symfony CLI (اختياري للتسهيل)
RUN wget https://get.symfony.com/cli/installer -O - | bash \
    && mv /root/.symfony*/bin/symfony /usr/local/bin/symfony

# Extensions
RUN docker-php-ext-configure intl \
 && docker-php-ext-install -j$(nproc) intl pdo_mysql zip opcache \
 && docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install -j$(nproc) gd

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1

# Entrypoint
COPY docker/php/entrypoint.sh /usr/local/bin/project-entrypoint.sh
RUN chmod +x /usr/local/bin/project-entrypoint.sh

WORKDIR /var/www
ENTRYPOINT ["/usr/local/bin/project-entrypoint.sh"]
CMD ["php-fpm"]
