var util = require('./lib/util');
var model = require('./model');
var port = process.env.PORT || 9999;
var server = util.configureServer();
require('date-utils');
var game = require('./game');

var tribeJoin = function(complete, owner, claim){
    getOrCreatePlayer(claim, function(c){
        if(c.owner == null){
            c.owner = owner;
            getOrCreatePlayer(owner, function(p){
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

var tribeUnjoin = function(complete, claim){
    getOrCreatePlayer(claim, function(c){
        if(c.owner != null){
            getOrCreatePlayer(c.owner, function(p){
                for(var i = 0; i < p.claims.length; i++){
                    if(p.claims[i] == claim){
                        p.claims.splice(i,1);
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

var getId = function(req) {
    return req.headers['x-secondlife-owner-key'] || "01234567-89ab-cdef-0123-456789abcdef";
};

var createDeliveryEvent = function(id){
    var newEvent = new model.Event({ avatar_id: id, type:"DELIVER", date: Date.today().addWeeks(1), executed: false });
    newEvent.save(function (err) {
        if (err) // TODO handle the error
            console.log('Could not create new event')
    });
};

var createDeliveryNotification = function(id){
    if(Math.random()<.5){
        var newNotification = new model.Notification({ avatar_id: id, type:"DELIVER_M", sent: false });
    }
    else{
        var newNotification = new model.Notification({ avatar_id: id, type:"DELIVER_F", sent: false });
    }
    newNotification.save(function (err) {
        if (err) // TODO handle the error
            console.log('Could not create new event')
    });
};

var getOrCreatePlayer = function(id,callback){
    var cb = function(err,players){
        if(players == null || players.length == 0){
            var newPlayer = new model.Player({ avatar_id: id, name: "???", status:"NORMAL", gender:"UNKNOWN", honor: 0, claims: [], owner: null });
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
    model.Player.find({ avatar_id: id }, cb)
};

var executeEvents = function(){
    var tmw= Date.tomorrow();
    model.Event
        .find()
        .where('executed').equals(false)
        .exec(function(err,events){
            if (err) {
                console.log('Error retrieving events.')
            }
            if(events){
                for(var i = 0 ; i < events.length; i++){
                    var ev = events[i];
                    if(ev.date < Date.now()){
                        if(ev.type == "DELIVER"){
                            getOrCreatePlayer(ev.avatar_id, function(p) {
                                p.status = "NORMAL";
                                createDeliveryNotification(p.avatar_id);
                                p.update();
                            });
                            ev.executed = true;
                            ev.save();
                        }
                    }
                }
            }
        });
}

var cronJob = require('cron').CronJob;
new cronJob('0 0 * * *', function(){
    executeEvents();
}, null, true, "America/Los_Angeles");

var getStatus = function(id,callback){
    getOrCreatePlayer(id,function(player){
        if(!player.status){
            player.status = "NORMAL";
            player.save();
        }
        callback(player.status);
    });
};

var getGender = function(id,callback){
    getOrCreatePlayer(id,function(player){
        if(!player.gender){
            player.gender = "UNKNOWN";
            player.save();
        }
        callback(player.gender);
    });
};

game.initialize(server);

server.get(/process/,
    function (req, res) {
        executeEvents();
        res.send("OK")
    }
);

server.get(/notifications/,
    function (req, res) {
        var id = getId(req);
        model.Notification
            .find({avatar_id: id, sent:false})
            .exec(function(err,notifications){
                if (err) {
                    console.log('Error retrieving notifications.')
                }
                if(notifications){
                    var notes = [];
                    for(var i = 0 ; i < notifications.length; i++){
                        notes.push(notifications[i].type);
                        notifications[i].sent = true;
                        notifications[i].save();
                    }
                    res.send(notes.join('|'));
                }
            });
    }
);

server.get(/status/,
    function (req, res) {
        var id = getId(req);
        getStatus(id,function(status){
            res.send(status);
        });
    }
);

server.get(/gender/,
    function (req, res) {
        var id = getId(req);
        getGender(id,function(gender){
            res.send(gender);
        });
    }
);

server.get('/claim',
    function (req, res) {
        var id = getId(req);
        var target = req.query.target;
        tribeJoin(function(err){
            if(err){
                res.send(err);
            }
            else{
                res.send("Player has been claimed.")
            }
        }, id, target);
    }
);

server.get('/unclaim',
    function (req, res) {
        var id = getId(req);
        var target = req.query.target;
        tribeUnjoin(function(err){
            if(err){
                res.send(err);
            }
            else{
                res.send("Player has been unclaimed.")
            }
        }, target);
    }
);

server.get(/action/,
    function (req, res) {
        var action = req.query.action;
        var id = getId(req);

        getOrCreatePlayer(id, function(p) {
            if(action == "breed"){
                var target = req.query.target;
                getOrCreatePlayer(target, function(targetPlayer){
                    if( target != id && targetPlayer.gender == "FEMALE") {
                        if( targetPlayer.status != "PREGNANT" && Math.random() < .15 ) {
                            targetPlayer.status = "PREGNANT";
                            createDeliveryEvent(target);
                            targetPlayer.save();
                        }
                    }
                });
                res.send(p.status);
            }
            if(action == "takeseed"){
                var target = req.query.target;
                getOrCreatePlayer(target, function(targetPlayer){
                    if( target != id && targetPlayer.gender == "MALE") {
                        if( p.status != "PREGNANT" && Math.random() < .15 ) {
                            createDeliveryEvent(id);
                            p.status = "PREGNANT";
                            p.save();
                        }
                    }
                });
                res.send(p.status);
            }
            else if(action == "gender"){
                p.gender = req.query.value;
                p.name = req.headers['x-secondlife-owner-name'] || "???";
                p.save();
                res.send(p.status);
            }
            else if(action == "bear"){
                p.status = "NORMAL";
                p.save();
                res.send(p.status);
            }
            else {
                res.send(p.status);
            }
        });
    }
);

server.listen(port);
