FROM python:3.12-slim

WORKDIR /app

RUN groupadd -r appuser && useradd -r -g appuser -m appuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

# Pre-download ONNX model to avoid cold-start delay
RUN python -c "from fastembed import TextEmbedding; TextEmbedding('sentence-transformers/all-MiniLM-L6-v2')" && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 9377

CMD ["python", "-m", "src.server", "--port", "9377"]
