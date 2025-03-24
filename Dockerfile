FROM nvidia/cuda:11.8.0-runtime-ubuntu22.04

# Install Python and required system dependencies
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3-pip \
    build-essential \
    libpq-dev \
    curl \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install PyTorch with CUDA support first
RUN pip3 install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Copy and install other requirements
COPY requirements.txt .
RUN pip3 install --no-cache-dir -U pip && \
    pip3 install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /app/logs

# Test CUDA availability
RUN python3 -c "import torch; print('CUDA available:', torch.cuda.is_available())"

EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Command is defined in docker-compose.yml