#!/bin/sh

# Copy template to actual config file
cp /etc/prometheus/prometheus.yml.template /etc/prometheus/prometheus.yml

# Replace environment variables using sed
sed -i "s/\${SERVICE_HOST}/$SERVICE_HOST/g" /etc/prometheus/prometheus.yml

# Start prometheus
exec /bin/prometheus "$@"