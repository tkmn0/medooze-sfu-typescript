sudo apt-get -y update
sudo apt-get -y upgrade --fix-missing
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
sudo apt-get -y install docker-compose