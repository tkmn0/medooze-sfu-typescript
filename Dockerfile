# base image
FROM ubuntu:18.04

# author
LABEL author="n0"
LABEL version="1.0.0"

# apt
RUN apt-get -y update	
RUN apt-get -y upgrade --fix-missing
RUN apt-get install -y curl
RUN apt-get install -y git
RUN apt-get install -y gcc make openssl
RUN apt install -y g++ 

# python
RUN apt-get install -y python2.7

# nodejs
RUN apt-get install -y nodejs npm
RUN npm install n -g
RUN n v11.4.0
RUN apt purge -y nodejs npm

# copy project with excluding some files, see .dockerignore
COPY . /root/app/