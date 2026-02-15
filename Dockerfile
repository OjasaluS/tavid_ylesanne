FROM php:8.5-fpm-alpine

# Install nginx and supervisor
RUN apk add --no-cache nginx supervisor composer

# Configure nginx
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Configure supervisor
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Set working directory
WORKDIR /var/www

# Copy composer files and install dependencies
COPY composer.json composer.lock* ./
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Copy application source
COPY src/ /var/www/html/

# Create required directories
RUN mkdir -p /run/nginx /var/log/supervisor

# Fix permissions
RUN chown -R www-data:www-data /var/www

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
