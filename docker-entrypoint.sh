#!/bin/sh
# Replace placeholder with runtime API_URL
if [ -n "$API_URL" ]; then
  find /usr/share/nginx/html/assets -name '*.js' -exec \
    sed -i "s|__VITE_API_URL__|${API_URL}|g" {} +
fi
exec nginx -g 'daemon off;'
