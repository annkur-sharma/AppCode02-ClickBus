#!/bin/bash

# ClickBus Deployment Script
echo "🚀 Deploying ClickBus Application..."

# Build Docker images
echo "📦 Building Docker images..."
docker build -f Dockerfile.frontend -t clickbus-frontend:latest .
docker build -f Dockerfile.backend -t clickbus-backend:latest .

# Deploy to Kubernetes
echo "☸️  Deploying to Kubernetes..."

# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create persistent volume and claim
kubectl apply -f k8s/persistent-volume.yaml

# Create configmap
kubectl apply -f k8s/configmap.yaml

# Create secrets (you need to edit k8s/secret.yaml with your actual connection string)
echo "⚠️  Please edit k8s/secret.yaml with your Azure Service Bus connection string before proceeding"
read -p "Press enter after updating the secret.yaml file..."
kubectl apply -f k8s/secret.yaml

# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml

# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml

# Deploy ingress
kubectl apply -f k8s/ingress.yaml

echo "✅ Deployment complete!"
echo ""
echo "📋 Check deployment status:"
echo "kubectl get pods -n clickbus"
echo ""
echo "🌐 Access the application:"
echo "kubectl port-forward -n clickbus service/clickbus-frontend 3000:80"
echo "Then visit: http://localhost:3000"
echo ""
echo "📊 View logs:"
echo "kubectl logs -n clickbus -l app=clickbus-backend -f"
