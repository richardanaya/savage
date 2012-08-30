define(['savage/server', 'savage/model', 'savage/store', 'savage/util', 'cron'], function (server, model, store, util, cron) {
    "use strict";

    server.get('/status',
        function (req, res) {
            var id = util.getId(req.query);
            store.getOrCreatePlayer(id, function (player) {
                res.send(player.status);
            });
        }
    );

    server.get('/gender',
        function (req, res) {
            var id = util.getId(req.query);
            var name = util.getName(req.headers);
            var genderValue = req.query.value;
            store.getOrCreatePlayer(id, function (player) {
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