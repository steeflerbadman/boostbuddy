#!/bin/bash

# Install dependencies
npm install

# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod
