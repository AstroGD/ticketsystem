module.exports = function (opt) {
    return new Promise((resolve, reject) => {
        const https = require('follow-redirects').https;

        var options = opt || {
            'method': 'GET',
            'hostname': 'software.astrogd.eu',
            'path': '/ticketsystem/version.json',
            'headers': {},
            'maxRedirects': 20
        };

        var req = https.request(options, function (res) {
            var chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function () {
                var body = Buffer.concat(chunks);
                resolve(body);
            });

            res.on("error", function (error) {
                reject(error);
            });
        });

        req.end();
    });
}