# Use an official Node.js runtime as the base image
FROM node:15

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the application
RUN npm run build

# Expose the desired port
EXPOSE 88

# Run the application
CMD ["npm", "start"]