# Installing Sentiment Prediction Feature

## Quick Installation

### 1. Activate Virtual Environment

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install New Dependency

```bash
pip install scikit-learn==1.4.0
```

Or install all requirements:

```bash
pip install -r requirements.txt
```

### 3. Verify Installation

```bash
python -c "from sklearn.linear_model import LinearRegression; print('✅ scikit-learn installed!')"
```

### 4. Start the Server

```bash
python main.py
```

Or:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Test the Prediction Endpoint

### Quick Test

```bash
curl -X POST "http://localhost:8000/api/predict" \
  -H "Content-Type: application/json" \
  -d '{"query": "iPhone 17", "hours_ahead": 12}'
```

### Run Test Suite

```bash
python test_prediction.py
```

### Test with Specific Query

```bash
python test_prediction.py "Bitcoin"
```

## Troubleshooting

### Issue: Module not found

**Error:**
```
ModuleNotFoundError: No module named 'sklearn'
```

**Solution:**
```bash
pip install --upgrade scikit-learn
```

### Issue: Version conflict

**Solution:**
```bash
pip install --force-reinstall scikit-learn==1.4.0
```

### Issue: SSL Certificate Error (macOS)

**Solution:**
```bash
pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org scikit-learn
```

## What's New

### Files Added
- ✅ `src/sentiment_predictor.py` - Prediction logic
- ✅ `test_prediction.py` - Test script
- ✅ `PREDICTION_API.md` - Full documentation
- ✅ Endpoint: `POST /api/predict`

### Models Added
- `PredictionRequest`
- `PredictionResponse`
- `PredictionPoint`
- `HistoricalSummary`

### Dependencies Added
- `scikit-learn==1.4.0`

## Next Steps

1. ✅ Install scikit-learn
2. ✅ Start the server
3. ✅ Test the endpoint
4. 📖 Read [`PREDICTION_API.md`](./PREDICTION_API.md) for full documentation
5. 🧪 Run `python test_prediction.py` for examples

## Verify Installation

Check if everything is working:

```bash
curl http://localhost:8000/
```

Should show:
```json
{
  "endpoints": {
    "predict": "/api/predict (POST) - Predict future sentiment trends"
  },
  "features": {
    "sentiment_prediction": true
  }
}
```

✅ **You're all set!**

