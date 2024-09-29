# Use the official Node.js 16 image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install --only=production

# Copy the rest of your application code
COPY . .

# Build the TypeScript code (if applicable)
RUN npm run build

# Expose any ports your application uses (if necessary)
# EXPOSE 3000

# Set environment variables (if any default values are needed)
# ENV NODE_ENV=production

# Start the application
CMD ["npm", "run", "start"]
