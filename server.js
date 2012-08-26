var util = require('./lib/util');

var port = process.env.PORT || 9999;
var server = util.configureServer();

var mongoose = require('mongoose');
require('date-utils');
var db = mongoose.createConnection("mongodb://nodejitsu:38e92c6d1e43014438e055d55d2e46a5@alex.mongohq.com:10069/nodejitsudb817222304338");
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('opened connection')
});

var schema = mongoose.Schema({ avatar_id: 'string', type: 'string', sent: Boolean, created: { type: Date, default: Date.now() }});
var Notification = db.model('Notification', schema);

var schema = mongoose.Schema({ avatar_id: 'string', type: 'string', date: Date, executed: Boolean });
var Event = db.model('Event', schema);

var schema = mongoose.Schema({ avatar_id: 'string', status: 'string', gender: 'string'});
var Player = db.model('Player', schema);

var getId = function(req) {
    return req.headers['x-secondlife-owner-key'] || "01234567-89ab-cdef-0123-456789abcdef";
};

var createDeliveryEvent = function(id){
    var newEvent = new Event({ avatar_id: id, type:"DELIVER", date: Date.today().addWeeks(1), executed: false });
    newEvent.save(function (err) {
        if (err) // TODO handle the error
            console.log('Could not create new event')
    });
};

var createDeliveryNotification = function(id){
    if(Math.random()<.5){
        var newNotification = new Notification({ avatar_id: id, type:"DELIVER_M", sent: false });
    }
    else{
        var newNotification = new Notification({ avatar_id: id, type:"DELIVER_F", sent: false });
    }
    newNotification.save(function (err) {
        if (err) // TODO handle the error
            console.log('Could not create new event')
    });
};

var getOrCreatePlayer = function(id,callback){
    var cb = function(err,players){
        if(players == null || players.length == 0){
            var newPlayer = new Player({ avatar_id: id, status:"NORMAL", gender:"UNKNOWN" });
            newPlayer.save(function (err) {
                if (err) // TODO handle the error
                    console.log('Could not create new player')
                callback(newPlayer);
            });
        }
        else {
            callback(players[0]);
        }
    };
    Player.find({ avatar_id: id }, cb)
};

var executeEvents = function(){
    var tmw= Date.tomorrow();
    Event
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

server.get(/process/,
    function (req, res) {
        executeEvents();
        res.send("OK")
    }
);

server.get(/notifications/,
    function (req, res) {
        var id = getId(req);
        Notification
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
