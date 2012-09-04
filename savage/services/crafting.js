define(['savage/server', 'savage/model' , 'savage/store', 'savage/util'], function (server, model, store, util) {
    var FAR_DISTANCE = 5;
    var CLOSE_DISTANCE = 1.5;
    server.get('/crafting/find',
        function (req, res) {
            var id = util.getId([req.headers,req.query]);
            var tool = req.query.tool;
            var sim = util.getSim([req.headers,req.query]);
            var location = util.getPosition([req.headers,req.query]);
            var px = location[0];
            var py = location[1];
            var pz = location[2];
            model.Resource.find({sim:sim, tool:tool}, function (err, docs) {
                var nearest = null;
                var dist = Infinity;
                if (docs.length > 0) {
                    for (var i = 0; i < docs.length; i++) {
                        var r = docs[i];
                        var d = Math.sqrt(Math.pow(r.x-px, 2)+Math.pow(r.y-py, 2)+Math.pow(r.z-pz, 2));
                        if(d < dist && d < FAR_DISTANCE){
                            dist = d;
                            nearest = r;
                        }
                    }
                }
                if(nearest != null){
                    if(!nearest.usages){
                        nearest.usages = [];
                    }
                    var usage = null;
                    for(var j = 0; j < nearest.usages.length; j++){
                        var u = nearest.usages[j];
                        if(u.avatarId == id){
                            usage = u;
                        }
                    }
                    if(usage == null){
                        usage = {avatarId:id,uses:0,lastUsed:null};
                        nearest.usages.push(usage);
                    }
                    if(usage.uses>=3){
                        var n = new Date();
                        n.addMinutes(-30);
                        debugger;
                        if(n>=usage.lastUsed){
                            usage.uses = 1;
                            usage.lastUsed = Date.now();
                            nearest.save();
                            res.send(util.randomElement(nearest.resources)+'|Using your '+tool+' you retrieve something.');
                        }
                        else{
                            res.send('|Using your '+tool+' you don\'t find anything.');
                        }
                    }
                    else {
                        usage.uses += 1;
                        usage.lastUsed = Date.now();
                        nearest.save();
                        res.send(util.randomElement(nearest.resources)+'|Using your '+tool+' you retrieve something.');
                    }
                }
                else {
                    res.send('|Using your '+tool+' you don\'t find anything.');
                }
            });
        }
    );

    server.get('/crafting/look',
            function (req, res) {
                var id = util.getId([req.headers,req.query]);
                var tool = req.query.tool;
                var sim = util.getSim([req.headers,req.query]);
                var location = util.getPosition([req.headers,req.query]);
                var px = location[0];
                var py = location[1];
                var pz = location[2];
                model.Resource.find({sim:sim, tool:tool}, function (err, docs) {
                    var nearest = null;
                    var dist = Infinity;
                    if (docs.length > 0) {
                        for (var i = 0; i < docs.length; i++) {
                            var r = docs[i];
                            var d = Math.sqrt(Math.pow(r.x-px, 2)+Math.pow(r.y-py, 2)+Math.pow(r.z-pz, 2));
                            if(d < dist && d < FAR_DISTANCE){
                                dist = d;
                                nearest = r;
                            }
                        }
                    }
                    var canSee = false;
                    if(nearest != null){
                        if(!nearest.usages){
                            nearest.usages = [];
                        }
                        var usage = null;
                        for(var j = 0; j < nearest.usages.length; j++){
                            var u = nearest.usages[j];
                            if(u.avatarId == id){
                                usage = u;
                            }
                        }
                        if(usage == null){
                            usage = {avatarId:id,uses:0,lastUsed:null};
                            nearest.usages.push(usage);
                        }
                        if(usage.uses>=3){
                            var n = new Date();
                            n.addMinutes(-30);
                            if(n>=usage.lastUsed){
                                canSee = true;
                            }
                        }
                        else {
                            canSee = true;
                        }
                    }

                    if(canSee && nearest != null){
                        if(d<CLOSE_DISTANCE){
                            res.send('CLOSE|You found something.');
                        }
                        else {
                            res.send('AROUND|Something is nearby.');
                        }
                    }
                    else {
                        res.send('FAR|There is nothing nearby.');
                    }
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