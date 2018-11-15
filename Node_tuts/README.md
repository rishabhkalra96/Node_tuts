WELCOME TO NODE TUTS APP


STEPS TO START THE APP

1. MAke sure you have openssl installed (openssl.org)
2. Make sure you have node installed
3. Run intitiateProject.bat for windows or createDirectories.sh for linux/git bash users to create directories needed for the project


TO GENERATE OPENSSL KEY 
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key-pem -out cert.pem

TO FIX OPENSSL NOT FOUND
echo "export LD_LIBRARY_PATH=/usr/local/bin/openssl" >> ~/.bashrc
export LD_LIBRARY_PATH=/lib:/usr/lib:/usr/local/lib


RUN APP BY
'node index.js' from root
