FROM python:3.12.10-slim

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Ensure .env is present in the container
COPY .env .env

# Expose the port Flask will run on
EXPOSE 5000

# Run the Flask app with Gunicorn for production
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "api:app"]