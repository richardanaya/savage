define(['savage/server', 'savage/model', 'savage/util', 'cron'], function (server, model, util, cron) {
    "use strict";

    server.get('/death',
        function (req, res) {
            var target = req.query.target;
            model.getOrCreatePlayer(target, function (player) {
                player.unclaim();
                player.honor = 0;
                player.save();
                res.send("OK");
            });
        }
    );

    server.get('/status',
        function (req, res) {
            var id = util.getId([req.headers,req.query]);
            model.getOrCreatePlayer(id, function (player) {
                res.send(player.status);
            });
        }
    );

    server.get('/gender',
        function (req, res) {
            var id = util.getId([req.headers,req.query]);
            var name = util.getName(req.headers);
            var genderValue = req.query.value;
            model.getOrCreatePlayer(id, function (player) {
                if (!player.gender || player.gender == "UNKNOWN") {
                    if (genderValue) {
                        player.gender = genderValue;
                    }
                    else {
                        player.gender = "UNKNOWN";
                    }
                }
                if (!player.name || player.name == util.DEFAULT_AVATAR_NAME) {
                    player.name = name;
                }
                player.save();
                res.send(player.gender);
            });
        }
    );
});