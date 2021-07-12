#!/bin/bash

systemctl disable renew.service
systemctl disable renew.timer
systemctl stop renew.timer 

cp /root/PROJECT__React-app-1/docker/deploy/ubuntuConfig/renew.timer /etc/systemd/system/renew.timer
cp /root/PROJECT__React-app-1/docker/deploy/ubuntuConfig/renew.service /etc/systemd/system/renew.service


systemctl enable  renew.service
systemctl enable renew.timer
systemctl start renew.timer 

systemctl list-timers