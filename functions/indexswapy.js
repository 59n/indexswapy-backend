const axios = require('axios');
const cheerio = require('cheerio');

// Cache for the ratios
let cachedRatios = {
    "NDX/QQQ Ratio": 41.10241216829076,
    "NQ/QQQ Ratio": 41.29471200210854,
    "ES/SPY Ratio": 10.072138887159946
};

let lastFetchTime = 0;
const FETCH_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds

async function fetchLatestRatios() {
    try {
        const response = await axios.get('https://spyconverter.com/converter.html');
        const $ = cheerio.load(response.data);
        
        // Find the script containing the ratios
        const scriptContent = $('script').filter((_, el) => {
            return $(el).text().includes('es_spy_ratio');
        }).text();

        // Extract ratios using regex
        const es_spy_ratio = scriptContent.match(/let es_spy_ratio = ([\d.]+);/)[1];
        const nq_qqq_ratio = scriptContent.match(/let nq_qqq_ratio = ([\d.]+);/)[1];
        const ndx_qqq_ratio = scriptContent.match(/let ndx_qqq_ratio = ([\d.]+);/)[1];

        // Update cached ratios
        cachedRatios = {
            "NDX/QQQ Ratio": parseFloat(ndx_qqq_ratio),
            "NQ/QQQ Ratio": parseFloat(nq_qqq_ratio),
            "ES/SPY Ratio": parseFloat(es_spy_ratio)
        };

        lastFetchTime = Date.now();
        console.log('Ratios updated:', cachedRatios);
    } catch (error) {
        console.error('Error fetching ratios:', error);
        // Keep using cached values if fetch fails
    }
}

// Initial fetch
fetchLatestRatios();

// Set up periodic fetching
setInterval(fetchLatestRatios, FETCH_INTERVAL);

exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': 'https://indexswapy.netlify.app',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    const path = event.path.replace('/.netlify/functions/indexswapy', '');

    // Handle conversion requests
    if (event.httpMethod === 'POST') {
        try {
            const body = JSON.parse(event.body);
            const { type, value } = body;

            if (!type || !value) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        status: 'error',
                        message: 'Missing type or value'
                    }),
                };
            }

            let result;
            switch (type) {
                case 'qqq_to_ndx':
                    result = value * cachedRatios["NDX/QQQ Ratio"];
                    break;
                case 'qqq_to_nq':
                    result = value * cachedRatios["NQ/QQQ Ratio"];
                    break;
                case 'nq_to_qqq':
                    result = value / cachedRatios["NQ/QQQ Ratio"];
                    break;
                case 'ndx_to_qqq':
                    result = value / cachedRatios["NDX/QQQ Ratio"];
                    break;
                case 'es_to_spy':
                    result = value / cachedRatios["ES/SPY Ratio"];
                    break;
                case 'spy_to_es':
                    result = value * cachedRatios["ES/SPY Ratio"];
                    break;
                default:
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({
                            status: 'error',
                            message: 'Invalid conversion type'
                        }),
                    };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    status: 'ok',
                    result: Number(result.toFixed(2))
                }),
            };
        } catch (error) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    status: 'error',
                    message: error.message
                }),
            };
        }
    }

    // Handle ratio endpoints
    if (path === '/ratios' || path === '/api/ratios' || path === '/data') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                status: 'ok',
                timestamp: new Date().toISOString(),
                ratios: cachedRatios
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