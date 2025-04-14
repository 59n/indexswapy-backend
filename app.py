from flask import Flask, jsonify
from flask_cors import CORS
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["https://spyconverter.com", "http://spyconverter.com"]}})

# Default ratios (same as in spy_converter.py)
DEFAULT_RATIOS = {
    "NDX/QQQ Ratio": 41.10241216829076,
    "NQ/QQQ Ratio": 41.29471200210854,
    "ES/SPY Ratio": 10.072138887159946
}

@app.route('/')
def index():
    return jsonify({
        "status": "ok",
        "message": "SPY Converter API is running",
        "endpoints": ["/", "/api/ratios", "/ratios", "/data"]
    })

@app.route('/api/ratios')
@app.route('/ratios')
@app.route('/data')
def get_ratios():
    logger.info("Ratios requested")
    return jsonify({
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "ratios": DEFAULT_RATIOS
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True) 