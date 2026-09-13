#!/usr/bin/env bash
# Builds every service's Docker image locally and loads it directly into your kind or
# minikube cluster's internal image store — no registry (Docker Hub, ECR, etc.) involved.
# This is the standard local-dev workflow: `imagePullPolicy: IfNotPresent` in every
# Deployment means Kubernetes will use the image already sitting in the cluster instead of
# trying (and failing) to pull `letsplaypro/auth-service:local` from the internet.
#
# Usage:
#   ./k8s/build-and-load.sh kind        # builds with your normal Docker, then loads into a
#                                         # kind cluster named "letsplaypro"
#   ./k8s/build-and-load.sh minikube    # builds directly against minikube's own Docker
#                                         # daemon, so there's nothing separate to "load"
#
# Re-run this after any code change before re-applying manifests — Kubernetes has no idea
# your source code changed, only that an image tag did (or didn't).

set -euo pipefail

TARGET="${1:-}"
SERVICES=(api-gateway auth-service product-service order-service dashboard-service notification-service payment-service)

if [[ "$TARGET" != "kind" && "$TARGET" != "minikube" ]]; then
  echo "Usage: $0 [kind|minikube]"
  exit 1
fi

if [[ "$TARGET" == "minikube" ]]; then
  echo "── Pointing this shell's docker CLI at minikube's Docker daemon ──"
  eval "$(minikube docker-env)"
fi

for svc in "${SERVICES[@]}"; do
  echo "── Building $svc ──────────────────────────────────────────────"
  docker build -t "letsplaypro/${svc}:local" "./${svc}"
done

if [[ "$TARGET" == "kind" ]]; then
  for svc in "${SERVICES[@]}"; do
    echo "── Loading $svc into kind ─────────────────────────────────────"
    kind load docker-image "letsplaypro/${svc}:local" --name letsplaypro
  done
else
  echo "Built directly against minikube's daemon — already available in the cluster, no load step needed."
fi

echo "Done. Images are now available inside the cluster."
