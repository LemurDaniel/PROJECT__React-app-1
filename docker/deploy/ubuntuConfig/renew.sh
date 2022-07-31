#!/bin/bash

file=$(cat /root/PROJECT__React-app-1/docker/deploy/ubuntuConfig/lastCertDate.txt)

lastDateFormated=$(date -d $file +%Y/%m/%d)
expirationFormated=$(date -d '70 days ago' +%Y/%m/%d)

lastDate=$(date -d $file '+%s')
expiration=$(date -d '70 days ago' +%s)

currentDate=$(date -d 'today' '+%Y/%m/%d')
currentLog=$currentDate'/ --- expiration: '$expirationFormated' - lastDate: '$lastDateFormated' || ['$expiration' -ge '$lastDate'] ===> '

if [ $expiration -ge $lastDate ];
then
    echo 'YES'

    docker-compose -f /root/PROJECT__React-app-1/docker/deploy/dc-web-db.yaml stop

    docker-compose -f /root/PROJECT__React-app-1/docker/deploy/certbot.yaml up
    docker-compose -f /root/PROJECT__React-app-1/docker/deploy/certbot.yaml stop

    currentLog=$currentLog' YES '
    echo $(date '+%Y/%m/%d') > /root/PROJECT__React-app-1/docker/deploy/ubuntuConfig/lastCertDate.txt
else
    echo 'NO'
    currentLog=$currentLog' NO '
fi  

echo $currentLog
echo $currentLog >> /root/PROJECT__React-app-1/docker/deploy/ubuntuConfig/log.txt

docker-compose -f /root/PROJECT__React-app-1/docker/deploy/dc-web-db.yaml up -d
