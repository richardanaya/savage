define(['savage/server', 'savage/model' , 'savage/store', 'savage/util', 'underscore'], function (server, model, store, util, _) {
    server.post('/divine/pray',
        function (req, res) {
            var player = req.query.player;
            var god = req.query.god;
            var body = "";

            req.on('data', function(chunk) {
                body += chunk.toString();
            });
            req.on('end', function() {
                var p = new model.Prayer();
                p.god = god;
                p.avatarId = player;
                p.prayer = body;
                p.save();
                res.send("OK");
            });
        }
    );

    server.get('/divine/sacrifice',function (req, res) {
        var respected_items =  [
            "minx",
            "grouse",
            "snake"
        ];
        var sacrificer = req.query.sacrificer;
        var item = req.query.item;
        var god = req.query.god;
        if(_.include(respected_items,item)){
            model.getOrCreatePlayer(sacrificer,function(p){
                p.honor += 1;
                p.save();
            });
        }
        var p = new model.Sacrifice();
        p.god = god;
        p.avatarId = sacrificer;
        p.sacrifice = item;
        p.save();
        res.send('OK')
    });

    server.get('/divine/all',
        function (req, res) {
            var all = [];
            var query = {};
            if(req.query.player){
                query =  {avatarId:player};
            }
            var player = req.query.player;
            model.Prayer.find(query,  function (err, prayers) {
                if(prayers.length > 0){
                    for(var i = 0 ; i < prayers.length; i++){
                        all.push(prayers[i]);
                    }
                }
                model.Sacrifice.find(query,  function (err, sacrifices) {
                    if(sacrifices.length > 0){
                        for(var j = 0 ; j < sacrifices.length; j++){
                            all.push(sacrifices[j]);
                        }
                    }
                    all.sort(function(a,b){
                        var da = new Date(a.created);
                        var db = new Date(b.created);
                        if( da > db){
                            return -1;
                        }
                        else {
                            return 1;
                        }
                    })

                    var k = 0;
                    var populate = function(complete){
                        if(k >= all.length){
                            complete();
                            return;
                        }
                        var a = all[k];
                        model.getOrCreatePlayer(a.avatarId,function(p){
                            var thing = a.toJSON();
                            thing.name = p.name;
                            thing.honor = p.honor;
                            thing.avatarId = p.avatarId;
                            all[k] = thing;
                            k++;
                            populate(complete);
                        })
                    };

                    var onDonePopulating = function(){
                        res.send(JSON.stringify(all));
                    };
                    populate(onDonePopulating);
                });
            });
        }
    );
});