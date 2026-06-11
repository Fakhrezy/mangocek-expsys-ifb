FROM node:18-slim

RUN apt-get update && apt-get install -y \
    python3 \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt ./
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir --upgrade pip && \
    /opt/venv/bin/pip install --no-cache-dir -r requirements.txt
ENV PATH="/opt/venv/bin:$PATH"


COPY package*.json ./
RUN npm ci --only=production


COPY server.js predict.py app.py check.py ./
COPY cnn_model_mangga.h5 ./

RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "server.js"]
