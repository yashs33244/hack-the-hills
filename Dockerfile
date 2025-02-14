# Use the official Node.js image as a base
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install ALL dependencies (including dev dependencies) with legacy peer deps
RUN npm install --legacy-peer-deps

# Copy the Prisma schema file separately
COPY prisma/schema.prisma ./prisma/schema.prisma

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]