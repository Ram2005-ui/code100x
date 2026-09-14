FROM node:18-bullseye

# Install Java, G++, and ensure Python3 is available
RUN apt-get update && \
    apt-get install -y default-jdk g++ python3 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all the backend code
COPY . .

EXPOSE 5000

# Start the application
CMD ["node", "index.js"]
