#!/bin/sh
# Copy template to actual config file
cp /etc/grafana/provisioning/alerting/contact_points.yml.template /etc/grafana/provisioning/alerting/contact_points.yml
# Replace environment variables using sed
sed -i "s/\${SERVICE_HOST}/$SERVICE_HOST/g" /etc/grafana/provisioning/alerting/contact_points.yml
# Start grafana
exec /usr/share/grafana/bin/grafana-server "$@"