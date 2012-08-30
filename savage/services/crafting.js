define(['savage/server', 'savage/model' , 'savage/store', 'savage/util'], function (server, model, store, util) {
    var FAR_DISTANCE = 10;
    var CLOSE_DISTANCE = 3;
    server.get('/crafting/find',
        function (req, res) {
            var id = util.getId(req.query);
            var tool = req.query.tool;
            var sim = util.getSim(req.query);
            var location = util.getPosition(req.query);
            var px = location[0];
            var py = location[1];
            var pz = location[2];
            var resources = model.Resource.find({sim:sim, tool:tool}, function (err, docs) {
                var nearest = null;
                var dist = Infinity;
                if (docs.length > 0) {
                    for (var i = 0; i < docs.length; i++) {
                        var r = docs[i];
                        var d = Math.sqrt(Math.pow(r.x-px, 2)+Math.pow(r.y-py, 2)+Math.pow(r.z-pz, 2));
                        if(d < dist && d < CLOSE_DISTANCE){
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
                        if(u.avatar_id == id){
                            usage = u;
                        }
                    }
                    if(usage == null){
                        usage = {avatar_id:id,uses:0,lastUsed:null};
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
                            res.send(util.randomElement(nearest.resources));
                        }
                        else{
                            res.send('');
                        }
                    }
                    else {
                        usage.uses += 1;
                        usage.lastUsed = Date.now();
                        nearest.save();
                        res.send(util.randomElement(nearest.resources));
                    }
                }
                else {
                    res.send('');
                }
            });
        }
    );

    server.get('/crafting/look',
            function (req, res) {
                var id = util.getId(req.query);
                var tool = req.query.tool;
                var sim = util.getSim(req.query);
                var location = util.getPosition(req.query);
                var px = location[0];
                var py = location[1];
                var pz = location[2];
                var resources = model.Resource.find({sim:sim, tool:tool}, function (err, docs) {
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
                        if(d<CLOSE_DISTANCE){
                            res.send('CLOSE');
                        }
                        else {
                            res.send('AROUND');
                        }
                    }
                    else {
                        res.send('FAR');
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