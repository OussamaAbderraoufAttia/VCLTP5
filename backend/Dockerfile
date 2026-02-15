# Use official Python runtime as base image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies for psycopg2
RUN apt-get update && apt-get install -y libpq-dev gcc

# Copy requirements and install
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

# Copy the rest of the code
COPY . .

# Expose port 5000 for Flask
EXPOSE 5000

# Command to run the application
CMD ["python3", "app.py"]
