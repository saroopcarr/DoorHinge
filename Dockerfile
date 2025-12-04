FROM node:20-alpine

WORKDIR /app

# Install OpenSSL required by Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package.json package-lock.json* yarn.lock* ./

# Install dependencies
RUN npm ci --only=production && npm install -g ts-node

# Copy source
COPY . .

# Generate Prisma client
RUN npm run prisma:generate

# Build Next.js
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]

