# Use an official Node.js runtime as a parent image
FROM node:20.11.1-bullseye

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY . .

RUN npm install