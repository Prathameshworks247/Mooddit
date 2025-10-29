# Installation Instructions

## Install Dependencies

You got a `ModuleNotFoundError: No module named 'google.generativeai'` error.

### Solution: Install the Required Packages

#### Step 1: Activate Virtual Environment

```bash
cd /Users/prathameshpatil/sinister-6/backend
source venv/bin/activate
```

#### Step 2: Install Packages

**Try this first:**
```bash
pip install google-generativeai==0.3.2 python-dotenv==1.0.0
```

**If you get SSL errors, try:**
```bash
pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org google-generativeai python-dotenv
```

**Or install all requirements:**
```bash
pip install -r requirements.txt
```

#### Step 3: Verify Installation

```bash
python3 -c "import google.generativeai; print('✅ Installed successfully!')"
```

---

## After Installation

### Get Gemini API Key (FREE)

1. Visit: **https://makersuite.google.com/app/apikey**
2. Sign in with Google
3. Click "Get API Key"
4. Copy your key

### Create .env File

```bash
cd /Users/prathameshpatil/sinister-6/backend
echo "GEMINI_API_KEY=paste_your_key_here" > .env
```

Replace `paste_your_key_here` with your actual key.

### Start Server

```bash
uvicorn main:app --reload
```

### Test

```bash
python test_api.py
```

Or visit: **http://localhost:8000/docs**

---

## Alternative: Use Without RAG

If you don't want to use the RAG endpoint right now, you can still use:

- ✅ `/api/charts` - Chart data
- ✅ `/api/analyze` - Full analysis  
- ✅ `/health` - Health check

The RAG endpoint will just return an error saying "Gemini API not configured" until you add your API key.

---

## Troubleshooting

### SSL Certificate Error

**Problem:** `SSLError(SSLCertVerificationError)`

**Solution 1:** Update pip
```bash
pip install --upgrade pip
```

**Solution 2:** Use trusted hosts
```bash
pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org google-generativeai
```

**Solution 3:** Install via conda (if you use it)
```bash
conda install -c conda-forge google-generativeai
```

### Permission Error

**Problem:** "not writeable"

**Solution:** Use virtual environment
```bash
source venv/bin/activate
pip install google-generativeai
```

### Already Installed But Still Error

**Problem:** Module not found but says installed

**Solution:** Check you're using the right Python
```bash
which python3
pip list | grep google
```

Make sure you're in the virtual environment:
```bash
source venv/bin/activate
```

---

## Quick Commands

```bash
# Full installation
cd /Users/prathameshpatil/sinister-6/backend
source venv/bin/activate
pip install google-generativeai python-dotenv

# Get API key from: https://makersuite.google.com/app/apikey

# Add to .env
echo "GEMINI_API_KEY=your_key" > .env

# Start server
uvicorn main:app --reload

# Test
python test_api.py
```

---

## What These Packages Do

- **`google-generativeai`**: Google's Gemini AI SDK (for RAG Q&A)
- **`python-dotenv`**: Loads environment variables from .env file

Both are free and lightweight!

