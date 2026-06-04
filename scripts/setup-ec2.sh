#!/bin/bash
# Setup script untuk Ubuntu EC2 — install Docker + Docker Compose lalu jalankan stack
set -e

echo "=== [1/5] Update & upgrade system ==="
sudo apt-get update -y
sudo apt-get upgrade -y

echo "=== [2/5] Install Docker ==="
sudo apt-get install -y ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Izinkan user saat ini menjalankan docker tanpa sudo
sudo usermod -aG docker "$USER"

echo "=== [3/5] Install Docker Compose standalone ==="
COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name"' | cut -d'"' -f4)
sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "=== [4/5] Install git ==="
sudo apt-get install -y git

echo "=== [5/5] Selesai ==="
echo ""
echo "Docker versi  : $(docker --version)"
echo "Compose versi : $(docker-compose --version)"
echo ""
echo "Langkah selanjutnya:"
echo "  1. Logout lalu login kembali agar permission docker group aktif"
echo "  2. Clone repo: git clone <url-repo>"
echo "  3. Masuk direktori: cd mangocek-app"
echo "  4. Buat file env: cp backend/.env.example backend/.env && nano backend/.env"
echo "  5. (Opsional) Taruh GCS key di: backend/gcs-key.json"
echo "  6. Buat file .env di root untuk docker-compose.prod.yml:"
echo "       echo 'DB_ROOT_PASSWORD=ganti_password' >> .env"
echo "       echo 'DB_NAME=mangocek_db'             >> .env"
echo "       echo 'REACT_APP_API_URL=http://<IP_EC2>:5000' >> .env"
echo "  7. Jalankan: docker-compose -f docker-compose.prod.yml up -d --build"
