FROM ubuntu:bionic
RUN apt-get update && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
    apt-get install -y nodejs

RUN curl -LO "https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl" && \
    chmod +x ./kubectl && \
    mv ./kubectl /usr/bin/kubectl

RUN kubectl version --client
COPY ./prodconfig /prodconfig
COPY ./extract_data.js /extract_data.js
COPY ./get_compute_usage.sh /get_compute_usage.sh

RUN chmod +x /get_compute_usage.sh
ENTRYPOINT [ "bash", "/get_compute_usage.sh" ]
