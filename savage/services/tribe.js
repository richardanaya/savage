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

    server.get('/tribe/all',function (req, res) {
        var ts = [];
        model.Tribe.find(function (err, tribes) {
            var work = [];
            var addWork = function(t,node) {
                work.push({tribe:t,player:node})
                for(var i = 0 ; i < node.claims.length; i++){
                    addWork(t,node.claims[i]);
                }
            };

            if(tribes != null){
                for(var i = 0 ; i < tribes.length; i++){
                    var tt = {name: tribes[i].name, honor: 0, size: 0, members: tribes[i].hierarchy};
                    addWork(tt, tribes[i].hierarchy);
                    ts.push(tt);
                }
            }

            var populate = function(complete){
                if(work.length == 0){
                    complete();
                    return;
                }
                var w = work[0];
                work.splice(0,1);
                model.getOrCreatePlayer(w.player.avatarId,function(p){
                    w.tribe.size += 1;
                    w.tribe.honor += p.honor;
                    w.player.name = p.name;
                    populate(complete);
                })
            };

            var onDonePopulating = function(){
                ts.sort(function(a,b){
                    return b.honor- a.honor;
                });
                res.send(JSON.stringify(ts));
            };
            populate(onDonePopulating);
        });
    });
});