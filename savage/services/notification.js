define(['savage/server', 'savage/model' , 'savage/store', 'savage/util'], function (server, model, store, util) {
    server.get('/notifications',
        function (req, res) {
            var id = util.getId([req.headers,req.query]);
            model.Notification
                .find({avatarId:id, sent:false})
                .exec(function (err, notifications) {
                    if (err) {
                        console.log('Error retrieving notifications.')
                    }
                    if (notifications) {
                        var notes = [];
                        for (var i = 0; i < notifications.length; i++) {
                            notes.push(notifications[i].type);
                            notifications[i].sent = true;
                            notifications[i].save();
                        }
                        res.send(notes.join('|'));
                    }
                });
        }
    );
});