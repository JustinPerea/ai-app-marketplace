#!/bin/bash

# Robust Next.js Dev Server Startup Script
# Prevents routes-manifest.json and other cache-related errors

echo "🔄 Starting robust dev server..."

# Function to kill all Node processes
cleanup_processes() {
    echo "🧹 Cleaning up existing processes..."
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "next-server" 2>/dev/null || true
    sleep 2
}

# Function to clear all caches
clear_caches() {
    echo "🗑️  Clearing all Next.js caches..."
    rm -rf .next
    rm -rf node_modules/.cache
    rm -rf .swc
    rm -rf .turbo
    rm -rf dist
    rm -rf build
}

# Function to verify port is free
check_port() {
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port 3000 is still in use, waiting..."
        sleep 3
        if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
            echo "❌ Port 3000 still occupied, killing processes..."
            lsof -ti:3000 | xargs kill -9 2>/dev/null || true
            sleep 2
        fi
    fi
}

# Main startup sequence
main() {
    cleanup_processes
    clear_caches
    check_port
    
    echo "🚀 Starting fresh dev server..."
    npm run dev
}

# Handle script interruption
trap cleanup_processes EXIT

main