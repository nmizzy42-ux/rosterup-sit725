# Use an official stable Node runtime matching project requirements
FROM node:20.19-alpine

# Set the working directory inside the container context
WORKDIR /usr/src/app

# Copy package descriptors first to cache dependency layers
COPY package*.json ./

# Install production-only packages cleanly
RUN npm install

# Copy all application files over to the container directory
COPY . .

# Inform Docker that the container listens on port 3000
EXPOSE 3000

# Execute server initialization command
CMD ["node", "server.js"]
