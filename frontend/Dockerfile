# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies with legacy peer deps to avoid ERESOLVE issues
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build arguments for environment variables
ARG REACT_APP_BACKEND_URL
ARG REACT_APP_RECAPTCHA_SITE_KEY

# Set environment variables for build
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV REACT_APP_RECAPTCHA_SITE_KEY=$REACT_APP_RECAPTCHA_SITE_KEY

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
