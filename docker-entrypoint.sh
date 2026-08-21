#!/bin/sh

cat > /usr/share/nginx/html/config.js <<EOF
window.OPENFIDS_CONFIG = {
  apiUrl: '${FIDS_API_URL}'
};
EOF

exec nginx -g 'daemon off;'
