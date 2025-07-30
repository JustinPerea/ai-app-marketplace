#!/bin/bash

# Health Check Script for Next.js Dev Server
# Checks critical endpoints and routes-manifest.json

echo "🔍 Running health check..."

# Function to check HTTP endpoint
check_endpoint() {
    local url=$1
    local name=$2
    local response=$(curl -s -I "$url" | head -1)
    
    if [[ $response == *"200 OK"* ]]; then
        echo "✅ $name: OK"
        return 0
    else
        echo "❌ $name: FAILED ($response)"
        return 1
    fi
}

# Function to check file existence
check_file() {
    local file=$1
    local name=$2
    
    if [ -f "$file" ]; then
        echo "✅ $name: EXISTS"
        return 0
    else
        echo "❌ $name: MISSING"
        return 1
    fi
}

# Main health check
main() {
    local failed=0
    
    echo "📊 Checking server endpoints..."
    check_endpoint "http://localhost:3000/" "Homepage" || ((failed++))
    check_endpoint "http://localhost:3000/setup" "Setup Page" || ((failed++))
    check_endpoint "http://localhost:3000/dashboard" "Dashboard" || ((failed++))
    
    echo "📁 Checking critical files..."
    check_file ".next/routes-manifest.json" "Routes Manifest" || ((failed++))
    check_file ".next/build-manifest.json" "Build Manifest" || ((failed++))
    
    echo "🎯 Health check complete!"
    
    if [ $failed -eq 0 ]; then
        echo "🎉 All systems operational!"
        exit 0
    else
        echo "⚠️  $failed issue(s) detected. Consider running: npm run dev:stable"
        exit 1
    fi
}

main