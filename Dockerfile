
# Use Node.js 20 LTS
FROM node:20-alpine

# Install PostgreSQL client and wait-for-it script dependencies
RUN apk add --no-cache postgresql-client bash

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create dist directory and build the application
RUN npm run build

# Install MongoDB shell for health checks
RUN wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apk add --no-cache gnupg && \
    echo "https://repo.mongodb.org/yum/amazon/2/mongodb-org/7.0/x86_64/" > /etc/apk/repositories.d/mongodb.list && \
    apk add --no-cache mongodb-mongosh || echo "Mongosh installation skipped"

# Copy startup script
COPY docker-start.sh /usr/local/bin/docker-start.sh
COPY docker-healthcheck.js ./
RUN chmod +x /usr/local/bin/docker-start.sh

# Expose port 5000
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5000

# Use custom startup script
CMD ["/usr/local/bin/docker-start.sh"]
