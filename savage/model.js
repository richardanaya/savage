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

    schema = mongoose.Schema({ tool:'string', x:'string', y:'string', z:'string', sim:'string', resources:['string'], usages:[
        {avatar_id:'string', uses:'number', lastUsed:Date}
    ]});
    var Resource = db.model('Resource', schema);

    return {
        Notification:Notification,
        Event:Event,
        Player:Player,
        Resource:Resource
    }
});