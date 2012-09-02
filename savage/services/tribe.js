define(['savage/server', 'savage/model' , 'savage/util'], function (server, model, util) {
    server.get('/tribe/claim',
        function (req, res) {
            var id = util.getId([req.headers, req.query]);
            var target = req.query.target;
            model.getOrCreatePlayer(id, function (p) {
                p.claim(function (err) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        res.send("Player has been claimed.")
                    }
                }, target)
            });
        }
    );

    server.get('/tribe/unclaim',
        function (req, res) {
            var target = req.query.target;
            model.getOrCreatePlayer(target, function (p) {
                p.unclaim(function (err) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        res.send("Player has been unclaimed.")
                    }
                })
            });
        }
    );
});