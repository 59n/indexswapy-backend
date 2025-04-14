const DEFAULT_RATIOS = {
    "NDX/QQQ Ratio": 41.10241216829076,
    "NQ/QQQ Ratio": 41.29471200210854,
    "ES/SPY Ratio": 10.072138887159946
};

exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': 'https://spyconverter.com',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: '',
        };
    }

    // Get the path
    const path = event.path.replace('/.netlify/functions/spy-converter', '');

    // Handle different endpoints
    if (path === '/' || path === '') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                status: 'ok',
                message: 'SPY Converter API is running',
                endpoints: ['/', '/api/ratios', '/ratios', '/data']
            }),
        };
    }

    // Handle ratio endpoints
    if (path === '/ratios' || path === '/api/ratios' || path === '/data') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                status: 'ok',
                timestamp: new Date().toISOString(),
                ratios: DEFAULT_RATIOS
            }),
        };
    }

    // Handle 404
    return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
            status: 'error',
            message: 'Endpoint not found'
        }),
    };
}; 