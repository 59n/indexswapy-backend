# IndexSwapy API

A serverless API for converting between different financial instruments (QQQ, NDX, NQ, ES, and SPY) using Netlify Functions.

## Features

- Convert between QQQ, NDX, NQ, ES, and SPY values
- Serverless architecture using Netlify Functions
- CORS enabled for indexswapy.com
- Multiple endpoint support

## API Endpoints

- `/.netlify/functions/indexswapy/` - API status and available endpoints
- `/.netlify/functions/indexswapy/api/ratios` - Get conversion ratios
- `/.netlify/functions/indexswapy/ratios` - Alternative endpoint for ratios
- `/.netlify/functions/indexswapy/data` - Alternative endpoint for ratios

## Response Format

```json
{
  "status": "ok",
  "timestamp": "2025-04-14T12:58:30.153Z",
  "ratios": {
    "NDX/QQQ Ratio": 41.10241216829076,
    "NQ/QQQ Ratio": 41.29471200210854,
    "ES/SPY Ratio": 10.072138887159946
  }
}
```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   node test-server.js
   ```

3. Test the endpoints:
   - http://localhost:8888/
   - http://localhost:8888/api/ratios
   - http://localhost:8888/ratios
   - http://localhost:8888/data

## Deployment

This project is configured for deployment on Netlify. The `netlify.toml` file contains the necessary configuration for:
- Function directory: `functions`
- Publish directory: `public`

## Author

- Name: 59n
- Email: 59n@panel.mom 