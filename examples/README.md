# Example Kubernetes Manifests

This directory contains Kubernetes manifest files for the Example Voting App (Instavote) used throughout the Kubernetes Intermediate course.

## Directory Structure

```
examples/
├── kind-cluster.yaml          # KIND multi-node cluster configuration
└── voting-app/                # Example Voting App manifests
    ├── vote-deployment.yaml
    ├── vote-service.yaml
    ├── result-deployment.yaml
    ├── result-service.yaml
    ├── worker-deployment.yaml
    ├── redis-deployment.yaml
    ├── redis-service.yaml
    ├── postgres-deployment.yaml
    └── postgres-service.yaml
```

## About the Example Voting App

The Example Voting App (Instavote) is a modernized, production-ready microservices application built specifically for cloud-native learning. It consists of five components:

- **vote** - Python/Flask frontend for vote submission (Port 8080)
- **result** - Node.js/Express frontend for results display (Port 8081)
- **worker** - Go background processor (Metrics on Port 8081)
- **redis** - Message queue for vote buffering (Port 6379)
- **postgres** - Database for persistent vote storage (Port 5432)

### Enhanced Features

Each service in the Instavote application includes:

- **Health checks** - `/health` endpoint for liveness probes
- **Readiness checks** - `/ready` endpoint that verifies backend connections
- **Metrics** - `/metrics` endpoint exposing Prometheus metrics
- **Structured logging** - JSON-formatted logs for observability
- **Graceful shutdown** - Proper SIGTERM handling
- **12-factor design** - Configuration via environment variables

These features enable the hands-on labs throughout the course, including pod scheduling with health probes (Module 1), HPA with metrics (Module 2), and service mesh observability (Module 4).

## Container Images

The manifests in this directory use battle-tested images from the Docker Samples project:

- `dockersamples/examplevotingapp_vote` - Python/Flask voting interface
- `dockersamples/examplevotingapp_result` - Node.js results dashboard
- `dockersamples/examplevotingapp_worker` - .NET background processor

These images are publicly available, well-maintained, and perfect for learning Kubernetes without worrying about application bugs.

### Source Code

An enhanced version with observability features (health checks, Prometheus metrics, structured logging) is available at [github.com/sfd301/instavote](https://github.com/sfd301/instavote) for reference, but the labs use the stable dockersamples images.

## Baseline Deployments

The manifests in `voting-app/` are intentionally **basic** - they represent a "works but not production-ready" baseline. They include:

- Single replicas for all components
- No resource requests or limits
- No pod affinity or scheduling rules
- No health/readiness probes configured
- Basic environment variable configuration
- Default namespace deployment

This baseline state is **by design**. The course modules progressively enhance these manifests:

- **Module 1** - Add scheduling constraints and health probes
- **Module 2** - Add resource limits and autoscaling
- **Module 3** - Migrate to Gateway API for traffic management
- **Module 4** - Evaluate service mesh integration
- **Module 5** - Add security policies and RBAC

## Usage

Deploy the Example Voting App to your Kubernetes cluster:

```bash
# Create KIND cluster
kind create cluster --config examples/kind-cluster.yaml --name voting-app

# Deploy infrastructure services first
kubectl apply -f examples/voting-app/redis-deployment.yaml
kubectl apply -f examples/voting-app/redis-service.yaml
kubectl apply -f examples/voting-app/postgres-deployment.yaml
kubectl apply -f examples/voting-app/postgres-service.yaml

# Deploy application services
kubectl apply -f examples/voting-app/worker-deployment.yaml
kubectl apply -f examples/voting-app/vote-deployment.yaml
kubectl apply -f examples/voting-app/vote-service.yaml
kubectl apply -f examples/voting-app/result-deployment.yaml
kubectl apply -f examples/voting-app/result-service.yaml

# Verify all pods are running
kubectl get pods

# Access the application
kubectl port-forward svc/vote 8080:8080   # Vote UI at http://localhost:8080
kubectl port-forward svc/result 8081:8081 # Results at http://localhost:8081
```

## Course Context

These manifests are part of the **Kubernetes Intermediate (SFD301)** course from School of DevOps. For complete lab instructions, troubleshooting guides, and explanations, see the course documentation at [schoolofdevops.github.io/kubernetes-intermediate](https://schoolofdevops.github.io/kubernetes-intermediate).

## License

Apache License 2.0 - See the main repository LICENSE file for details.
