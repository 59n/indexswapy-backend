const axios = require('axios');
const cheerio = require('cheerio');

// Cache for the ratios - start empty
let cachedRatios = null;
let lastFetchTime = 0;
const FETCH_INTERVAL = 15 * 60 * 1000; // 15 minutes in milliseconds

async function fetchLatestRatios() {
    try {
        const response = await axios.get('https://spyconverter.com/converter.html');
        const $ = cheerio.load(response.data);
        
        // Find all script tags and look for the one containing the ratios
        const scripts = $('script').toArray();
        let scriptContent = '';
        
        for (const script of scripts) {
            const content = $(script).text();
            if (content.includes('es_spy_ratio') && 
                content.includes('nq_qqq_ratio') && 
                content.includes('ndx_qqq_ratio')) {
                scriptContent = content;
                break;
            }
        }

        if (!scriptContent) {
            throw new Error('Could not find script containing ratios');
        }

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
        if (!cachedRatios) {
            // If we have no cached data, throw the error
            throw error;
        }
        // Otherwise, keep using cached values if fetch fails
    }
}

// Initial fetch
fetchLatestRatios().catch(error => {
    console.error('Initial fetch failed:', error);
});

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

    // Fetch latest ratios on every request
    try {
        await fetchLatestRatios();
    } catch (error) {
        if (!cachedRatios) {
            // If we have no cached data, return an error
            return {
                statusCode: 503,
                headers,
                body: JSON.stringify({
                    status: 'error',
                    message: 'Service temporarily unavailable - unable to fetch ratios'
                }),
            };
        }
        // Otherwise, continue with cached values
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