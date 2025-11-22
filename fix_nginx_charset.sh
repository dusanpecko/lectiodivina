#!/bin/bash

# Backup existing config
cp /www/server/panel/vhost/nginx/proxy/lectio.one/*.conf /tmp/lectio_proxy_backup.conf

# Add charset to proxy config
cat > /www/server/panel/vhost/nginx/proxy/lectio.one/lectio_one.conf << 'EOF'
#PROXY-START/
location ^~ /
{
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header REMOTE-HOST $remote_addr;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_http_version 1.1;
    
    # Force UTF-8 charset
    charset utf-8;
    
    # Disable caching for API endpoints
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass 1;
        proxy_no_cache 1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        charset utf-8;
    }
    
    # Cache static assets
    if ( $uri ~* "\.(gif|png|jpg|css|js|woff|woff2)$" )
    {
        expires 1m;
    }
    
    proxy_ignore_headers Set-Cookie Cache-Control expires;
    proxy_cache cache_one;
    proxy_cache_key $host$uri$is_args$args;
    proxy_cache_valid 200 304 301 302 1m;
}
#PROXY-END/
EOF

# Reload Nginx
nginx -t && systemctl reload nginx

echo "✅ Nginx config updated with UTF-8 charset and API cache bypass"
