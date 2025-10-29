#!/bin/bash
# Script to start the FastAPI server accessible from the network

echo "🚀 Starting Reddit Sentiment Analysis API (Network Mode)"
echo "=" 

# Activate virtual environment
source venv/bin/activate

# Get IP address
echo ""
echo "📡 Your network IP addresses:"
echo "=" 
if command -v ipconfig &> /dev/null; then
    # macOS
    echo "WiFi (en0): $(ipconfig getifaddr en0 2>/dev/null || echo 'Not connected')"
    echo "Ethernet (en1): $(ipconfig getifaddr en1 2>/dev/null || echo 'Not connected')"
else
    # Linux
    ip addr show | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | cut -d/ -f1
fi

echo ""
echo "🌐 Server will be accessible at:"
echo "  - From this laptop: http://localhost:8000"
echo "  - From other devices: http://<YOUR_IP>:8000"
echo "  - API docs: http://<YOUR_IP>:8000/docs"
echo ""
echo "📝 Replace <YOUR_IP> with one of the IP addresses above"
echo "=" 
echo ""
echo "⚡ Starting server..."
echo ""

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

