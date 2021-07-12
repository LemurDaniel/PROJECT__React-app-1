#!/bin/bash

file=$(cat /etc/nginx/lastCertDate.txt)

echo $(date -d $file '+%Y/%m/%d')
echo $(date -d '80 days ago' '+%Y/%m/%d')

lastDate=$(date -d $file '+%s')
expiration=$(date -d '80 days ago' +%s)

if [ $expiration -ge $lastDate ];
then
    certbot certonly -v --standalone --agree-tos -m landau.daniel.1998@gmail.com -d www.daniel-testing.cloud,daniel-testing.cloud
    echo 'YES'
else
    echo 'NO'
fi  

echo $(date '+%Y/%m/%d') > /etc/nginx/lastCertDate.txt

nginx