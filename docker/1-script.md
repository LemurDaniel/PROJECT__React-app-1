## Generate Self-signed SSL for local-testing

<details><br>

#### Create docker image with openssl installed:

    docker build -t gen_ssl:v1 -f "${pwd}\docker\df-ssl" .

#### Spin up Container with localfolder mounted:

    docker run -v "${pwd}\docker\gen-certs:/var/project/cert" -it gen_ssl:v1 bash

#### Enter following command:

    openssl req -config ssl.key.conf -days 365 \
            -new -x509 -newkey rsa:2048 -nodes \
            -keyout ssl.key.pem -out ssl.cert.pem

#### Import ***.cert.pem file into windows Cert-Manager:

    search windows for "Computerzertifikate verwalten"

    Go to "Vertrauenswürdige Stammzertifizierungsstellen"

    Import the ***.cert.pem file

</details>


___


## Generate Private / Public Key pair for JWT signing

<details><br>

#### Generate private key:
        
        openssl genrsa -out jwt.private.key 512

#### Generate public key:

        openssl rsa -in jwt.private.key -outform PEM -pubout -out jwt.public.key

</details>


___

https://gist.github.com/kekru/974e40bb1cd4b947a53cca5ba4b0bbe5


alias dockerx="docker --tlsverify -H daniel-testing.cloud:2376 --tlscacert=./ca.pem --tlscert=./client-cert.pem --tlskey=./client-key.pem ps"