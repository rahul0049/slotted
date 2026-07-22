FROM ubuntu:22.04


RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    libhiredis-dev \
    && rm -rf /var/lib/apt/lists/*

#
RUN git clone https://github.com/sewenew/redis-plus-plus.git /tmp/redis-plus-plus \
    && cd /tmp/redis-plus-plus \
    && mkdir build && cd build \
    && cmake .. \
    && make -j$(nproc) \
    && make install \
    && ldconfig \
    && rm -rf /tmp/redis-plus-plus

WORKDIR /app

COPY . .


RUN mkdir -p build && cd build \
    && cmake .. \
    && make -j$(nproc)

EXPOSE 5000

CMD ["./build/queue_engine"]