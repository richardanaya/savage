var initialize = function (server) {
    server.get('/game',
        function (req, res) {
            res.send("OK")
        }
    );
};

exports.initialize = initialize;