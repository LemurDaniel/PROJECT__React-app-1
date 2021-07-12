#!/bin/bash

cp ./nginx.conf /etc/nginx/nginx.conf
cp ./renew.timer /etc/systemd/system/renew.service
cp ./renew.timer /etc/systemd/system/renew.unit


systemctl enable  renew.service
systemctl enable renew.timer
systemctl start renew.timer 


systemctl list-timers