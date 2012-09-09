define(['mongoose'], function (mongoose) {
    var db = mongoose.createConnection("mongodb://savage:hearteater@ds037447.mongolab.com:37447/savage");
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        console.log('Database connection opened.')
    });

    var schema = mongoose.Schema({ avatarId:'string', type:'string', sent:Boolean, created:{ type:Date, default:Date.now() }});
    var Notification = db.model('Notification', schema);

    schema = mongoose.Schema({ avatarId:'string', type:'string', date:Date, executed:Boolean });
    var Event = db.model('Event', schema);

    schema = mongoose.Schema({ avatarId:'string', name:'string', status:'string', gender:'string', honor:'number', owner:'string', tribe:{ type:mongoose.Schema.Types.ObjectId, ref:'Tribe' }, claims:['string']});
    var Player = db.model('Player', schema);


    schema = mongoose.Schema({ hierarchy:mongoose.Schema.Types.Mixed, name: { type: 'string', default: '???' } });
    var Tribe = db.model('Tribe', schema);

    Tribe.prototype.addToTribe = function (ownerId, avatarId) {
        if (Tribe.avatarExistsInTree(this.hierarchy, avatarId)) {
            return false;
        };
        if (Tribe.addClaimToOwner(this.hierarchy, ownerId, avatarId)) {
            this.markModified('hierarchy');
            this.save();
            return true;
        }
        else {
            return false;
        }
    };

    Tribe.prototype.removeFromTribe = function (avatarId) {
        if(!Tribe.avatarExistsInTree(this.hierarchy, avatarId)) {
            return false;
        };
        if (Tribe.removeClaimFromOwner(this.hierarchy, avatarId)) {
            this.markModified('hierarchy');
            this.save();
            return true;
        }
        else {
            return false;
        }
    };

    Tribe.avatarExistsInTree = function (treeNode, avatarId) {
        if (treeNode.avatarId == avatarId) {
            return true;
        }
        for (var i = 0; i < treeNode.claims.length; i++) {
            if (Tribe.avatarExistsInTree(treeNode.claims[i], avatarId)) {
                return true;
            }
        }
        return false;
    };

    Tribe.addClaimToOwner = function (treeNode, ownerId, avatarId) {
        if (treeNode.avatarId == ownerId) {
            treeNode.claims.push({avatarId:avatarId, claims:[]});
            return true;
        }
        for (var i = 0; i < treeNode.claims.length; i++) {
            if (Tribe.addClaimToOwner(treeNode.claims[i], ownerId, avatarId)) {
                return true;
            }
        }
        return false;
    };

    Tribe.removeClaimFromOwner = function (treeNode, avatarId) {
        for (var i = 0; i < treeNode.claims.length; i++) {
            if(treeNode.claims[i].avatarId == avatarId){
                treeNode.claims.splice(i,1);
                return true;
            }
        }

        for (var i = 0; i < treeNode.claims.length; i++) {
            if (Tribe.removeClaimFromOwner(treeNode.claims[i], avatarId)) {
                return true;
            }
        }
        return false;
    };

    Player.prototype.claim = function (complete, claim) {
        var context = this;
        if (this.tribe == null) {
            var t = new Tribe();
            t.hierarchy = {avatarId:this.avatarId, claims:[]};
            t.markModified('hierarchy');
            t.save();
            this.tribe = t;
            this.save();
        }
        getOrCreatePlayer(claim, function (c) {
            Tribe.find({_id:context.tribe}, function(err,tribes){
                if (tribes[0].addToTribe(context.avatarId, c.avatarId)) {
                    c.tribe = context.tribe;
                    c.save();
                    complete(null);
                }
                else {
                    complete("The gods will not permit this.");
                }
            });
        });
    };

    Player.prototype.unclaim = function (complete) {
        var context = this;
        if (this.tribe != null) {
            Tribe.find({_id:context.tribe}, function(err,tribes){
                tribes[0].removeFromTribe(context.avatarId);
            });
        }
        this.tribe = null;
        this.save();
        complete(null);
    };

    schema = mongoose.Schema({ tool:'string', x:'number', y:'number', z:'number', sim:'string', resources:['string'],
        usages:[{avatarId:'string', uses:'number', lastUsed:Date}], uses: { type: 'number', default: '1' }, occurrence: { type: 'string', default: 'EVERYDAY' }});
    var Resource = db.model('Resource', schema);

    var getOrCreatePlayer = function (id, callback) {
        var cb = function (err, players) {
            if (players == null || players.length == 0) {
                var newPlayer = new Player({ avatarId:id, name:"???", status:"NORMAL", gender:"UNKNOWN", honor:0, claims:[], tribe:null, owner:null });
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
        Player.find({ avatarId:id }, cb)
    };

    return {
        Notification:Notification,
        Event:Event,
        Player:Player,
        Tribe:Tribe,
        Resource:Resource,
        getOrCreatePlayer:getOrCreatePlayer
    }
});