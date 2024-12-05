#!/bin/sh

# Wait for a moment to ensure environment variables are loaded
sleep 2

# Replace placeholder with actual SERVICE_HOST value
sed -i "s/SERVICE_HOST_PLACEHOLDER/${SERVICE_HOST}/g" /etc/prometheus/prometheus.yml

# Start Prometheus with the provided arguments
exec /bin/prometheus "$@"