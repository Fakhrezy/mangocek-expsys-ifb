# Node 18 (Debian Bookworm) + Python 3 tanpa build-essential
FROM node:18-slim

# Hanya install python3 + venv — TANPA python3-pip dari apt
# (python3-pip menarik gcc/g++/build-essential yang tidak diperlukan)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Buat venv lalu upgrade pip via ensurepip (built-in, ringan)
# (TensorFlow besar ~600MB, proses ini butuh waktu cukup lama)
COPY requirements.txt ./
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir --upgrade pip && \
    /opt/venv/bin/pip install --no-cache-dir -r requirements.txt
ENV PATH="/opt/venv/bin:$PATH"

# Install Node.js dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source files (model .h5 di-copy terakhir untuk memanfaatkan layer cache)
COPY server.js predict.py app.py check.py ./
COPY cnn_model_mangga.h5 ./

RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "server.js"]
