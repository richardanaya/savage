define(['savage/server', 'savage/model' , 'savage/store', 'savage/util'], function (server, model, store, util) {
    var tribeJoin = function (complete, owner, claim) {
        store.getOrCreatePlayer(claim, function (c) {
            if (c.owner == null) {
                c.owner = owner;
                store.getOrCreatePlayer(owner, function (p) {
                    p.claims.push(claim);
                    p.save();
                    complete(null);
                });
                c.save();
            }
            else {
                complete("Claim is already owned by another tribe.");
            }
        });
    };

    var tribeUnjoin = function (complete, claim) {
        store.getOrCreatePlayer(claim, function (c) {
            if (c.owner != null) {
                store.getOrCreatePlayer(c.owner, function (p) {
                    for (var i = 0; i < p.claims.length; i++) {
                        if (p.claims[i] == claim) {
                            p.claims.splice(i, 1);
                        }
                    }
                    p.save();
                });
            }
            c.owner = null;
            c.save();
            complete(null);
        });
    };

    server.get('/tribe/claim',
        function (req, res) {
            var id = util.getId(req.query);
            var target = req.query.target;
            tribeJoin(function (err) {
                if (err) {
                    res.send(err);
                }
                else {
                    res.send("Player has been claimed.")
                }
            }, id, target);
        }
    );

    server.get('/tribe/unclaim',
        function (req, res) {
            var id = util.getId(req.query);
            var target = req.query.target;
            tribeUnjoin(function (err) {
                if (err) {
                    res.send(err);
                }
                else {
                    res.send("Player has been unclaimed.")
                }
            }, target);
        }
    );
});