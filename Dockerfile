ARG NGINX_IMAGE_TAG
FROM nginxinc/nginx-unprivileged:${NGINX_IMAGE_TAG}
LABEL org.opencontainers.image.source="https://github.com/antblu/antblu"
LABEL org.opencontainers.image.description="Anthony Bluemel portfolio"
ENV NGINX_ENVSUBST_OUTPUT_DIR=/tmp
ENV CONTACT_UPSTREAM=http://127.0.0.1:9
USER root
RUN rm /etc/nginx/conf.d/default.conf && ln -s /tmp/default.conf /etc/nginx/conf.d/default.conf
USER 101
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY portfolio/dist/ /usr/share/nginx/html/
EXPOSE 8080
