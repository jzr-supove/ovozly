# Stage 1: Build the React App
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production=false

# Copy the rest of the project files
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve the React App with Nginx
FROM nginx:stable-alpine

# Set working directory for Nginx
WORKDIR /usr/share/nginx/html

# Copy built files from the builder stage
COPY --from=builder /app/dist .

# Apply custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
