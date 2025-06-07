FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all source code, keys, and context files
COPY . .

EXPOSE 3000

CMD ["node", "wineVCVerifier.mjs"]