#!/bin/bash

# Create environment variables file if it doesn't exist
echo "Creating environment variables file..."

cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb+srv://minor:I8VsYMIfegPVghFV@cluster0.pvgh62j.mongodb.net/minor_project?retryWrites=true&w=majority
OTX_API_KEY=c0add590346591497cc498bea89edb031beaba56ee3216e97669fc172a220df8
JWT_SECRET=yourSuperSecretKeyHere
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EOF

# Copy environment variables to backend
cp .env backend/.env

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Run the seed script to populate the database with fresh data
echo "Seeding the database with fresh data..."
cd backend
node src/config/seed.js
cd ..

# Start backend server
echo "Starting backend server..."
cd backend
node src/server.js &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Start frontend server
echo "Starting frontend server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Function to handle script termination
function cleanup() {
  echo "Shutting down servers..."
  kill $BACKEND_PID
  kill $FRONTEND_PID
  exit
}

# Register the cleanup function for these signals
trap cleanup SIGINT SIGTERM

echo "Servers are running. Press Ctrl+C to stop."
wait 