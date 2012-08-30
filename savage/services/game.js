define(['savage/server', 'savage/model', 'savage/store', 'savage/util', 'cron'], function (server, model, store, util, cron) {
    "use strict";

    server.get('/status',
        function (req, res) {
            var id = util.getId(req.query);
            store.getOrCreatePlayer(id, function (player) {
                if (!player.status) {
                    player.status = "NORMAL";
                    player.save();
                }
                res.send(player.status);
            });
        }
    );

    server.get('/gender',
        function (req, res) {
            var id = util.getId(req.query);
            store.getOrCreatePlayer(id, function (player) {
                if (!player.gender) {
                    player.gender = "UNKNOWN";
                    player.save();
                }
                res.send(player.gender);
            });
        }
    );

    server.get('/game/action',
        function (req, res) {
            var action = req.query.action;
            var id = util.getId(req.query);

            store.getOrCreatePlayer(id, function (p) {
                if (action == "gender") {
                    p.gender = req.query.value;
                    p.name = req.headers['x-secondlife-owner-name'] || "???";
                    p.save();
                    res.send(p.status);
                }
                else {
                    res.send(p.status);
                }
            });
        }
    );
});