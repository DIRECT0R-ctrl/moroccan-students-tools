#!/bin/bash

# Quick deployment script for GitHub Pages
# Run this after setting up your GitHub repository

echo "🚀 Deploying Moroccan Student Tools..."

# Initialize git if not already done
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
fi

# Add all files
echo "📦 Adding files..."
git add .

# Commit with timestamp
echo "💾 Committing changes..."
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"

# Push to main branch
echo "📤 Pushing to GitHub..."
git push -u origin main

echo "✅ Deployment complete!"
echo "🌐 Your site will be available at: https://USERNAME.github.io/REPOSITORY-NAME"
echo "💡 Don't forget to enable GitHub Pages in your repo settings!"

