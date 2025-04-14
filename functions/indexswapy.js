const DEFAULT_RATIOS = {
    "NDX/QQQ Ratio": 41.10241216829076,
    "NQ/QQQ Ratio": 41.29471200210854,
    "ES/SPY Ratio": 10.072138887159946
};

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
                    result = value * DEFAULT_RATIOS["NDX/QQQ Ratio"];
                    break;
                case 'qqq_to_nq':
                    result = value * DEFAULT_RATIOS["NQ/QQQ Ratio"];
                    break;
                case 'nq_to_qqq':
                    result = value / DEFAULT_RATIOS["NQ/QQQ Ratio"];
                    break;
                case 'ndx_to_qqq':
                    result = value / DEFAULT_RATIOS["NDX/QQQ Ratio"];
                    break;
                case 'es_to_spy':
                    result = value / DEFAULT_RATIOS["ES/SPY Ratio"];
                    break;
                case 'spy_to_es':
                    result = value * DEFAULT_RATIOS["ES/SPY Ratio"];
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