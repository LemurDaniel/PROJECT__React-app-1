#!/bin/bash

file=$(cat /root/PROJECT__React-app-1/docker/deploy/unbuntu-config/lastCertDate.txt)

echo $(date -d $file '+%Y/%m/%d')
echo $(date -d '80 days ago' '+%Y/%m/%d')

lastDate=$(date -d $file '+%s')
expiration=$(date -d '80 days ago' +%s)

if [ $expiration -ge $lastDate ];
then
    echo 'YES'
    docker-compose -f /root/PROJECT__React-app-1/docker/deploy/dc-web-db.yaml stop

    docker-compose -f /root/PROJECT__React-app-1/docker/deploy/certbot.yaml stop

    docker-compose -f /root/PROJECT__React-app-1/docker/deploy/dc-web-db.yaml start
else
    echo 'NO'
fi  

echo $(date '+%Y/%m/%d') > /root/PROJECT__React-app-1/docker/deploy/unbuntu-config/lastCertDate.txt