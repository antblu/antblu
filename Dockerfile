ARG NGINX_IMAGE_TAG
FROM nginxinc/nginx-unprivileged:${NGINX_IMAGE_TAG}
LABEL org.opencontainers.image.source="https://github.com/antblu/antblu"
LABEL org.opencontainers.image.description="Anthony Bluemel portfolio"
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY portfolio/dist/ /usr/share/nginx/html/
EXPOSE 8080
