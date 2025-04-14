const http = require('http');
const { handler } = require('./functions/spy-converter');

const server = http.createServer(async (req, res) => {
    // Convert Node.js request to Netlify Function event format
    const event = {
        httpMethod: req.method,
        path: req.url,
        headers: req.headers
    };

    // Call our function
    const result = await handler(event);

    // Set headers
    Object.entries(result.headers || {}).forEach(([key, value]) => {
        res.setHeader(key, value);
    });

    // Send response
    res.statusCode = result.statusCode;
    res.end(result.body);
});

const PORT = 8888;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Test endpoints:');
    console.log('http://localhost:8888/');
    console.log('http://localhost:8888/api/ratios');
    console.log('http://localhost:8888/ratios');
    console.log('http://localhost:8888/data');
}); 