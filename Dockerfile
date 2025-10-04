# Use a full Node image to install dependencies and build the TypeScript code
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json files and install ALL dependencies (including dev)
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Compile TypeScript to JavaScript, generating the 'dist' folder
RUN npm run build

# Prune development dependencies for the final stage
RUN npm prune --production

# Start from a slim Node image for the final version
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy only the production node_modules from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy the compiled JavaScript code from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the port the API uses
EXPOSE 3000

# The default command will start the API, but we can override this in docker-compose.yml
CMD ["node", "dist/server.js"]