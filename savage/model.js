define(['mongoose'], function (mongoose) {
    var db = mongoose.createConnection("mongodb://savage:hearteater@ds037447.mongolab.com:37447/savage");
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        console.log('Database connection opened.')
    });

    var schema = mongoose.Schema({ avatar_id:'string', type:'string', sent:Boolean, created:{ type:Date, default:Date.now() }});
    var Notification = db.model('Notification', schema);

    schema = mongoose.Schema({ avatar_id:'string', type:'string', date:Date, executed:Boolean });
    var Event = db.model('Event', schema);

    schema = mongoose.Schema({ avatar_id:'string', name:'string', status:'string', gender:'string', honor:'number', owner:'string', claims:['string']});
    var Player = db.model('Player', schema);

    Player.prototype.claim = function (complete, claim) {
        var context = this;
        getOrCreatePlayer(claim, function (c) {
            if (c.owner == null) {
                c.owner = context.id;
                c.save();
                context.claims.push(claim);
                context.save();
                complete(null);
            }
            else {
                complete("Claim is already owned by another tribe.");
            }
        });
    };

    Player.prototype.unclaim = function (complete) {
        if (this.owner != null) {
            getOrCreatePlayer(this.owner, function (p) {
                for (var i = 0; i < p.claims.length; i++) {
                    if (p.claims[i] == claim) {
                        p.claims.splice(i, 1);
                    }
                }
                p.save();
            });
        }
        this.owner = null;
        this.save();
        complete(null);
    };

    schema = mongoose.Schema({ tool:'string', x:'string', y:'string', z:'string', sim:'string', resources:['string'], usages:[
        {avatar_id:'string', uses:'number', lastUsed:Date}
    ]});
    var Resource = db.model('Resource', schema);

    var getOrCreatePlayer = function (id, callback) {
        var cb = function (err, players) {
            if (players == null || players.length == 0) {
                var newPlayer = new Player({ avatar_id:id, name:"???", status:"NORMAL", gender:"UNKNOWN", honor:0, claims:[], owner:null });
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
        Player.find({ avatar_id:id }, cb)
    };

    return {
        Notification:Notification,
        Event:Event,
        Player:Player,
        Resource:Resource,
        getOrCreatePlayer:getOrCreatePlayer
    }
});