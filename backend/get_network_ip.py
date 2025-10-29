#!/usr/bin/env python3
"""
Helper script to get network IP address for accessing the API from other devices
"""

import socket
import subprocess
import platform

def get_local_ip():
    """Get the local IP address of this machine"""
    try:
        # Create a socket to get the local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # Connect to a public DNS server (doesn't actually send data)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return None

def get_all_ips():
    """Get all network IP addresses"""
    ips = []
    
    system = platform.system()
    
    if system == "Darwin":  # macOS
        try:
            # Try to get WiFi IP
            result = subprocess.run(["ipconfig", "getifaddr", "en0"], 
                                    capture_output=True, text=True)
            if result.returncode == 0 and result.stdout.strip():
                ips.append(("WiFi (en0)", result.stdout.strip()))
        except:
            pass
        
        try:
            # Try to get Ethernet IP
            result = subprocess.run(["ipconfig", "getifaddr", "en1"], 
                                    capture_output=True, text=True)
            if result.returncode == 0 and result.stdout.strip():
                ips.append(("Ethernet (en1)", result.stdout.strip()))
        except:
            pass
    
    elif system == "Linux":
        try:
            # Use ip command on Linux
            result = subprocess.run(["ip", "-4", "addr", "show"], 
                                    capture_output=True, text=True)
            if result.returncode == 0:
                lines = result.stdout.split('\n')
                for i, line in enumerate(lines):
                    if 'inet ' in line and '127.0.0.1' not in line:
                        # Extract interface name from previous line
                        if i > 0:
                            interface = lines[i-1].split(':')[1].strip().split('@')[0]
                        else:
                            interface = "unknown"
                        ip = line.split('inet ')[1].split('/')[0].strip()
                        ips.append((interface, ip))
        except:
            pass
    
    elif system == "Windows":
        try:
            # Use ipconfig on Windows
            result = subprocess.run(["ipconfig"], capture_output=True, text=True)
            if result.returncode == 0:
                lines = result.stdout.split('\n')
                current_adapter = None
                for line in lines:
                    if 'adapter' in line.lower():
                        current_adapter = line.split(':')[0].strip()
                    elif 'IPv4 Address' in line and current_adapter:
                        ip = line.split(':')[1].strip()
                        if ip and not ip.startswith('127.'):
                            ips.append((current_adapter, ip))
        except:
            pass
    
    # Fallback: Use socket method
    if not ips:
        local_ip = get_local_ip()
        if local_ip:
            ips.append(("Primary", local_ip))
    
    return ips

def main():
    print("\n🌐 Network Configuration for API Access")
    print("=" * 60)
    
    ips = get_all_ips()
    
    if not ips:
        print("❌ Could not determine network IP address")
        print("   Make sure you're connected to WiFi or Ethernet")
        return
    
    print("\n📡 Your network IP addresses:")
    for interface, ip in ips:
        print(f"   • {interface}: {ip}")
    
    primary_ip = ips[0][1] if ips else "YOUR_IP"
    
    print("\n🚀 To start the server accessible from the network:")
    print("   cd /Users/prathameshpatil/sinister-6/backend")
    print("   source venv/bin/activate")
    print("   uvicorn main:app --reload --host 0.0.0.0 --port 8000")
    
    print("\n🌐 Access URLs:")
    print(f"   • From this laptop:     http://localhost:8000")
    print(f"   • From other devices:   http://{primary_ip}:8000")
    print(f"   • API docs:             http://{primary_ip}:8000/docs")
    
    print("\n📝 Make sure both devices are on the same WiFi network!")
    
    print("\n🔥 Firewall Check:")
    print("   If you still can't connect, you may need to:")
    print("   • Allow port 8000 in your firewall")
    system = platform.system()
    if system == "Darwin":
        print("   • macOS: System Preferences > Security & Privacy > Firewall > Firewall Options")
    elif system == "Windows":
        print("   • Windows: Windows Defender Firewall > Allow an app")
    elif system == "Linux":
        print("   • Linux: sudo ufw allow 8000/tcp")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()

