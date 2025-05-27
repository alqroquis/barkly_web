# SSL 

временный nginx.conf для сертификата

```
events {}

http {
    server {
        listen 80;
        server_name mapmylove.ru;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            proxy_pass http://app:8080;
        }
    }
}

```


```
docker-compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email liretmat@gmail.com --agree-tos --no-eff-email -d mapmylove.ru
```