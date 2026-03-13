FROM docker.io/cloudflare/sandbox:0.7.17-python

WORKDIR /workspace

ENV PATH="/usr/local/python/bin:${PATH}"

RUN python3 -m pip install --no-cache-dir pytest

EXPOSE 8080
