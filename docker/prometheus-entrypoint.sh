#!/bin/sh

# Wait for a moment to ensure environment variables are loaded
sleep 2

# Create a new prometheus.yml from the template
cat /etc/prometheus/prometheus.yml.template | \
    sed "s/SERVICE_HOST_PLACEHOLDER/${SERVICE_HOST}/g" | \
    sed "s/API_KEY_PLACEHOLDER/${API_KEY}/g" > /etc/prometheus/prometheus.yml

# Start Prometheus with the provided arguments
exec /bin/prometheus "$@"