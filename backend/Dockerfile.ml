FROM python:3.11-slim

WORKDIR /app

COPY requirements.ml.txt ./
RUN pip install --no-cache-dir -r requirements.ml.txt

COPY app.py ./
COPY cnn_model_mangga.h5 ./

EXPOSE 5001

CMD ["python", "app.py"]
