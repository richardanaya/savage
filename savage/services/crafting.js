define(['savage/server', 'savage/model' , 'savage/store', 'savage/util', 'underscore'], function (server, model, store, util, _) {
    var FAR_DISTANCE = 8;
    var CLOSE_DISTANCE = 2;

    var isOccurring = function (occurrence) {
        var d = new Date();
        if (occurrence == "EVERYDAY") {
            return true;
        }
        else if (occurrence == "EVENDAYS") {
            if (d.getOrdinalNumber() % 2 == 0) {
                return true;
            }
        }
        else if (occurrence == "ODDDAYS") {
            if (d.getOrdinalNumber() % 2 == 1) {
                return true;
            }
        }
        return false;
    };

    server.get('/crafting/find',
        function (req, res) {
            var id = util.getId([req.headers, req.query]);
            var tool = req.query.tool;
            var sim = util.getSim([req.headers, req.query]);
            var location = util.getPosition([req.headers, req.query]);
            var px = location[0];
            var py = location[1];
            var pz = location[2];
            model.Resource.find({sim:sim, tool:tool}, function (err, docs) {
                var nearest = null;
                var dist = Infinity;
                if (docs.length > 0) {
                    for (var i = 0; i < docs.length; i++) {
                        var r = docs[i];
                        var d = Math.sqrt(Math.pow(r.x - px, 2) + Math.pow(r.y - py, 2));//+Math.pow(r.z-pz, 2)
                        var occurring = isOccurring(r.occurrence);
                        if (occurring && d < dist && d < FAR_DISTANCE && pz < 100) {
                            dist = d;
                            nearest = r;
                        }
                    }
                }
                if (nearest != null) {
                    if (!nearest.usages) {
                        nearest.usages = [];
                    }
                    var usage = null;
                    for (var j = 0; j < nearest.usages.length; j++) {
                        var u = nearest.usages[j];
                        if (u.avatarId == id) {
                            usage = u;
                        }
                    }

                    if (usage != null && usage.uses >= nearest.uses) {
                        var n = new Date();
                        n.addMinutes(-30);
                        if (n >= usage.lastUsed) {
                            usage.uses = 1;
                            usage.lastUsed = Date.now();
                            nearest.save();
                            res.send(util.randomElement(nearest.resources) + '|Using your ' + tool + ' you retrieve something.');
                        }
                        else {
                            res.send('|Using your ' + tool + ' you don\'t find anything.');
                        }
                    }
                    else {
                        if (usage == null) {
                            usage = {avatarId:id, uses:1, lastUsed:Date.now()};
                            nearest.usages.push(usage);
                            nearest.save();
                        }
                        else {
                            usage.uses = usage.uses + 1;
                            usage.lastUsed = Date.now();
                            nearest.save();
                        }

                        res.send(util.randomElement(nearest.resources) + '|Using your ' + tool + ' you retrieve something.');
                    }
                }
                else {
                    res.send('|Using your ' + tool + ' you don\'t find anything.');
                }
            });
        }
    );

    server.get('/crafting/look',
        function (req, res) {
            var id = util.getId([req.headers, req.query]);
            var tool = req.query.tool;
            var sim = util.getSim([req.headers, req.query]);
            var location = util.getPosition([req.headers, req.query]);
            var px = location[0];
            var py = location[1];
            var pz = location[2];
            model.Resource.find({sim:sim, tool:tool}, function (err, docs) {
                var nearest = null;
                var dist = Infinity;
                if (docs.length > 0) {
                    for (var i = 0; i < docs.length; i++) {
                        var r = docs[i];
                        var d = Math.sqrt(Math.pow(r.x - px, 2) + Math.pow(r.y - py, 2)); //+Math.pow(r.z-pz, 2)
                        var occurring = isOccurring(r.occurrence);
                        if (occurring && d < dist && d < FAR_DISTANCE  && pz < 100) {
                            dist = d;
                            nearest = r;
                        }
                    }
                }
                var canSee = false;
                if (nearest != null) {
                    if (!nearest.usages) {
                        nearest.usages = [];
                    }
                    var usage = null;
                    for (var j = 0; j < nearest.usages.length; j++) {
                        var u = nearest.usages[j];
                        if (u.avatarId == id) {
                            usage = u;
                        }
                    }

                    if (usage != null && usage.uses >= nearest.uses) {
                        var n = new Date();
                        n.addMinutes(-30);
                        if (n >= usage.lastUsed) {
                            canSee = true;
                        }
                    }
                    else {
                        canSee = true;
                    }
                }

                if (canSee && nearest != null) {
                    if (dist < CLOSE_DISTANCE) {
                        res.send('CLOSE|There is something close.|' + dist);
                    }
                    else {
                        res.send('AROUND|Keep searching.|' + dist);
                    }
                }
                else {
                    res.send('FAR|There is nothing nearby.|' + dist);
                }
            });
        }
    );

    server.get('/crafting/validate',
        function (req, res) {
            var masterItems = [
                "Minx",
                "Grouse",
                "Snake",
                "Arrowheads",
                "Backpack",
                "Cut Hide",
                "Feathers",
                "Hide",
                "Quiver",
                "Rock",
                "Sheaf of Flax",
                "Stick",
                "Stone Cutter",
                "Stone Hammer",
                "Twine",
                "Arrows",
                "Bow",
                "Poison Arrows",
                "Stone Spear"
            ];
            model.Resource.find({}, function (err, docs) {
                var failed = [];
                if (docs.length > 0) {
                    for (var i = 0; i < docs.length; i++) {
                        var r = docs[i];
                        for (var j = 0; j < r.resources.length; j++) {
                            var r2 = r.resources[j];
                            if (!_.include(masterItems, r2)) {
                                failed.push(r);
                                break;
                            }
                        }
                    }
                }
                res.send(JSON.stringify(failed));
            });
        }
    );
    /*server.get('/crafting/test',
     function (req, res) {
     var r = new model.Resource();
     r.sim = "Sexy Love";
     r.x = 0;
     r.y = 0;
     r.z = 0;
     r.tool = 'hand';
     r.resources = ['stick', 'stick', 'rock'];
     r.save();
     res.send('okay');
     }
     );*/
});