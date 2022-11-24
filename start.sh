#!/bin/sh
w2 start -p 8080
su pptruser -c 'node /data/supernova/dist/index.js'
