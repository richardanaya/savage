define(['savage/model'], function (model) {
    return {
        getId:function (req) {
            return req.headers['x-secondlife-owner-key'] || "01234567-89ab-cdef-0123-456789abcdef";
        },
        getOrCreatePlayer:function (id, callback) {
            var cb = function (err, players) {
                if (players == null || players.length == 0) {
                    var newPlayer = new model.Player({ avatar_id:id, name:"???", status:"NORMAL", gender:"UNKNOWN", honor:0, claims:[], owner:null });
                    newPlayer.save(function (err) {
                        if (err) // TODO handle the error
                            console.log('Could not create new player');
                        callback(newPlayer);
                    });
                }
                else {
                    callback(players[0]);
                }
            };
            model.Player.find({ avatar_id:id }, cb)
        }
    }
});