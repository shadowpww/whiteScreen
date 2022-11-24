FROM csighub.tencentyun.com/moggyteam/debian-node

USER root

WORKDIR /data/supernova

COPY . .
COPY ./fonts /usr/share/fonts/mac

RUN npm config set registry https://mirrors.tencent.com/npm/ && \
    npm install -g whistle && \
    npm install && \
    npm run build && \
    chmod -R 755 /usr/lib/node_modules && \
    w2 start && w2 stop && \
    cp -f Rainbow/properties /root/.WhistleAppData/.whistle/properties/ && \
    cp -f Rainbow/pptruser /etc/sudoers.d && \
    cp /root/.WhistleAppData/.whistle/certs/root.crt /usr/local/share/ca-certificates/ && \
    echo "root.crt" >> /etc/ca-certificates.conf && \
    update-ca-certificates

# Add user so we don't need --no-sandbox.
RUN mkdir /home/pptruser && \
    useradd -d /home/pptruser -g root -G users,sudo,audio,video pptruser && \
    echo pptruser:pptruser | chpasswd && \
    chown -R pptruser /home/pptruser && \
    chown -R pptruser /data/supernova

# USER pptruser

CMD [ "./start.sh" ]

EXPOSE 8080