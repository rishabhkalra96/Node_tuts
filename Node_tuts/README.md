WELCOME TO NODE TUTS APP


STEPS TO START THE APP

1. MAke sure you have openssl installed (openssl.org)
2. Make sure you have node installed



TO GENERATE OPENSSL KEY 
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key-pem -out cert.pem

TO FIX OPENSSL NOT FOUND
echo "export LD_LIBRARY_PATH=/usr/local/bin/openssl" >> ~/.bashrc
export LD_LIBRARY_PATH=/lib:/usr/lib:/usr/local/lib


RUN APP BY
'node index.js' from root


API CALLS SUPPORTED

API URL                                 TYPE                            DETAILS
--------------------------------------------------------------------------------------------------
localhost:3000/ping                  |   GET      |              check if server is alive
                                     |            |
localhost:3000/users?phone=phoneNo   |   GET      |              get user details
                                     |            |
localhost:3000/users                 |   POST     |              register a new user with payload                                      |            |              (firstName 'string',lastName                                          |            |                'string', password 'string',                                        |            |                 tosAggreement 'boolean',phone                                      |            |                            'string')