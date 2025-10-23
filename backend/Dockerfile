# Dockerfile (backend)
FROM php:8.2-cli

# Cài đặt các tiện ích và PHP extension cần thiết
RUN apt-get update && apt-get install -y \
    unzip git libpq-dev libzip-dev libpng-dev libjpeg-dev libfreetype6-dev \
    && docker-php-ext-install pdo pdo_mysql gd zip

# Cài Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Đặt thư mục làm việc
WORKDIR /var/www/html




