# Network Access & CORS Troubleshooting

## Problem: Accessing API from Another Device on Same WiFi

If you're getting CORS errors or connection refused errors when accessing the API from a different laptop/device on the same WiFi network, follow these steps.

## Quick Fix (3 Steps)

### Step 1: Find Your IP Address

```bash
cd /Users/prathameshpatil/sinister-6/backend
python get_network_ip.py
```

This will show you:
- Your network IP address(es)
- URLs to access the API
- Firewall instructions

### Step 2: Start Server on Network Interface

**Option A - Using the helper script:**
```bash
./start_network.sh
```

**Option B - Manual command:**
```bash
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Key: Use `--host 0.0.0.0` instead of default localhost!**

### Step 3: Access from Other Device

From your other laptop, use:
```
http://<YOUR_IP>:8000
```

For example:
```
http://192.168.1.100:8000/docs
```

## What Was Fixed

### 1. CORS Configuration Issue

**Problem:** 
```python
allow_origins=["*"]
allow_credentials=True  # ❌ Not allowed with ["*"]
```

**Solution:**
```python
allow_origins=["*"]
allow_credentials=False  # ✅ Fixed
```

The CORS specification **does not allow** `allow_credentials=True` with `allow_origins=["*"]`. This was causing CORS preflight requests to fail.

### 2. Server Binding Issue

**Problem:**
```bash
uvicorn main:app --reload  # Binds to 127.0.0.1 (localhost only)
```

**Solution:**
```bash
uvicorn main:app --reload --host 0.0.0.0  # Binds to all interfaces
```

By default, uvicorn binds to `localhost` (127.0.0.1), which is only accessible from the same machine. Using `--host 0.0.0.0` makes it accessible from the network.

## Common Issues & Solutions

### Issue 1: "Connection Refused"

**Cause:** Server is not running or not bound to network interface

**Solution:**
```bash
# Make sure you're using 0.0.0.0 as the host
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Issue 2: "CORS Policy Error"

**Cause:** Browser blocking cross-origin requests

**Solution:** ✅ Already fixed in `main.py` - CORS is now properly configured

### Issue 3: "Network Unreachable"

**Cause:** Devices are on different networks

**Solution:**
- Ensure both devices are on the **same WiFi network**
- Check if you're connecting to the correct IP address
- Try pinging the server from the client: `ping <SERVER_IP>`

### Issue 4: "Timeout" or "Can't Connect"

**Cause:** Firewall blocking port 8000

**Solution:**

**macOS:**
```bash
# Allow Python/uvicorn through firewall
# Or temporarily disable firewall for testing:
# System Preferences > Security & Privacy > Firewall > Turn Off Firewall
```

**Linux:**
```bash
sudo ufw allow 8000/tcp
```

**Windows:**
```powershell
# Windows Defender Firewall > Allow an app
# Or:
netsh advfirewall firewall add rule name="FastAPI" dir=in action=allow protocol=TCP localport=8000
```

### Issue 5: "Mixed Content" (HTTPS/HTTP)

**Cause:** Frontend is HTTPS but API is HTTP

**Solution:**
- Either serve API over HTTPS
- Or use HTTP for both during development

## Testing the Connection

### From Server Machine:

```bash
# Test locally
curl http://localhost:8000/

# Test on network interface
curl http://$(python get_network_ip.py | grep "Primary" | awk '{print $3}'):8000/
```

### From Client Machine:

```bash
# Test connection (replace with your server's IP)
curl http://192.168.1.100:8000/

# Test API endpoint
curl -X POST "http://192.168.1.100:8000/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "limit": 10}'
```

### Browser Test:

Open in browser on client machine:
```
http://192.168.1.100:8000/docs
```

## Production Considerations

### 1. Specific CORS Origins

For production, replace `["*"]` with specific origins:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",           # Local development
        "http://192.168.1.50:3000",        # Network development
        "https://your-frontend.com"        # Production
    ],
    allow_credentials=True,  # Now OK with specific origins
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. Use Environment Variables

```python
import os

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    ...
)
```

Then set in `.env`:
```bash
ALLOWED_ORIGINS=http://localhost:3000,http://192.168.1.50:3000
```

### 3. HTTPS in Production

Use a reverse proxy (nginx, Caddy) or deploy to a platform that provides HTTPS:
- Vercel
- Railway
- Heroku
- AWS EC2 with Let's Encrypt

### 4. Rate Limiting

Add rate limiting for production:

```bash
pip install slowapi
```

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/analyze")
@limiter.limit("10/minute")
async def analyze_sentiment_endpoint(request: Request, ...):
    ...
```

## Network Debugging Commands

### Find Your IP:

**macOS:**
```bash
ipconfig getifaddr en0  # WiFi
ipconfig getifaddr en1  # Ethernet
```

**Linux:**
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
hostname -I
```

**Windows:**
```powershell
ipconfig | findstr IPv4
```

### Check if Port is Open:

**macOS/Linux:**
```bash
lsof -i :8000
netstat -an | grep 8000
```

**Windows:**
```powershell
netstat -an | findstr 8000
```

### Test Connection from Client:

```bash
# Ping server
ping 192.168.1.100

# Test port
telnet 192.168.1.100 8000
# or
nc -zv 192.168.1.100 8000
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Client Laptop (192.168.1.50)                           │
│  ┌─────────────────────────────────────────┐            │
│  │  Browser                                 │            │
│  │  http://192.168.1.100:8000/api/analyze  │            │
│  └─────────────────┬───────────────────────┘            │
└────────────────────┼──────────────────────────────────────┘
                     │
                     │ HTTP Request
                     │ (CORS headers included)
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Server Laptop (192.168.1.100)                          │
│  ┌─────────────────────────────────────────┐            │
│  │  FastAPI Server                          │            │
│  │  Listening on 0.0.0.0:8000               │            │
│  │  CORS: allow_origins=["*"]               │            │
│  └─────────────────┬───────────────────────┘            │
└────────────────────┼──────────────────────────────────────┘
                     │
                     ▼
              ✅ Response with
              CORS headers
```

## Verification Checklist

- [ ] Server is running with `--host 0.0.0.0`
- [ ] CORS is configured (✅ already done)
- [ ] Both devices are on same WiFi network
- [ ] Firewall allows port 8000
- [ ] Using correct IP address (not localhost)
- [ ] Port 8000 is not in use by another app

## Quick Commands Reference

```bash
# Get IP address
python get_network_ip.py

# Start server (network accessible)
./start_network.sh

# Or manually:
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Test from client
curl http://<SERVER_IP>:8000/
```

## Still Having Issues?

1. **Check server logs** - Look for any error messages
2. **Try from same machine first** - Use `http://localhost:8000`
3. **Verify network connectivity** - `ping <SERVER_IP>`
4. **Check firewall** - Temporarily disable to test
5. **Try different port** - Use `--port 8080` instead

## Summary

✅ **CORS is now fixed** in `main.py`:
- `allow_credentials=False` with `allow_origins=["*"]`
- `expose_headers=["*"]` added

✅ **Helper scripts created**:
- `get_network_ip.py` - Find your IP
- `start_network.sh` - Start server on network

✅ **Start server with**:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ **Access from other device**:
```
http://<YOUR_IP>:8000
```

That's it! Your API should now be accessible from any device on your WiFi network. 🎉

