#!/bin/bash

file=$(cat /root/PROJECT__React-app-1/docker/deploy/ubuntuConfig/lastCertDate.txt)

echo $(date -d $file '+%Y/%m/%d')
echo $(date -d '80 days ago' '+%Y/%m/%d')

lastDate=$(date -d $file '+%s')
expiration=$(date -d '80 days ago' +%s)

if [ $expiration -ge $lastDate ];
then
    echo 'YES'
    docker-compose -f /root/PROJECT__React-app-1/docker/deploy/dc-web-db.yaml stop

    docker-compose -f /root/PROJECT__React-app-1/docker/deploy/certbot.yaml up
    docker-compose -f /root/PROJECT__React-app-1/docker/deploy/certbot.yaml stop

    echo $(date '+%Y/%m/%d') > /root/PROJECT__React-app-1/docker/deploy/ubuntuConfig/lastCertDate.txt
else
    echo 'NO'
fi  

docker-compose -f /root/PROJECT__React-app-1/docker/deploy/dc-web-db.yaml up -d