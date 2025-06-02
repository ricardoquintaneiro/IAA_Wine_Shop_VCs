# Use Node.js
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app source
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start the Vite dev server with hot reload
CMD ["npm", "run", "dev", "--", "--host"]
