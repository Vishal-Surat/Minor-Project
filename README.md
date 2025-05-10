# Network Security Dashboard

A comprehensive security dashboard for monitoring network threats, logs, and visualizations with AlienVault OTX integration.

## Features

- Real-time security dashboard with threat visualization
- IP and network flow mapping
- Log analysis and monitoring
- AlienVault OTX Threat Intelligence integration
- Authentication with account lockout protection
- Brute force detection and IP blocking

## Requirements

- Node.js (v14 or higher)
- MongoDB
- AlienVault OTX API Key

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb+srv://minor:I8VsYMIfegPVghFV@cluster0.pvgh62j.mongodb.net/minor_project?retryWrites=true&w=majority
OTX_API_KEY=c0add590346591497cc498bea89edb031beaba56ee3216e97669fc172a220df8
JWT_SECRET=yourSuperSecretKeyHere
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Starting the Application

### Method 1: Using the Start Script

```bash
# Make the script executable
chmod +x start.sh

# Run the script
./start.sh
```

### Method 2: Manual Start

#### Backend

```bash
# Install dependencies
cd backend
npm install

# Start server
npm start
```

#### Frontend

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm start
```

## Accessing the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## Login Credentials

- Email: admin@example.com
- Password: admin123

## Threat Intelligence Features

The application integrates with AlienVault OTX to provide:

- IP reputation checking
- Domain reputation checking
- Latest global threats feed
- Real-time threat alerts

## Security Features

- Account lockout after 5 failed login attempts (5-minute lockout)
- IP blocking for suspicious activity
- Brute force attack detection
- Real-time security alerts via WebSockets

## Architecture

- **Frontend**: React.js with Tailwind CSS for UI, Chart.js for data visualization
- **Backend**: Node.js with Express.js for API
- **Database**: MongoDB for data storage
- **Real-time Updates**: Socket.io for real-time notifications

## Screenshots

[Add screenshots here]

## License

MIT 