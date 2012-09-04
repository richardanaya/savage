define(['savage/server', 'savage/model' , 'savage/util', 'cron'], function (server, model, util, cron) {
    var createDeliveryEvent = function (id) {
        var newEvent = new model.Event({ avatarId:id, type:"DELIVER", date:Date.today().addWeeks(1), executed:false });
        newEvent.save(function (err) {
            if (err) // TODO handle the error
                console.log('Could not create new event')
        });
    };

    var createDeliveryNotification = function (id) {
        var newNotification = new model.Notification({ avatarId:id, type:"DELIVER_F", sent:false });
        if (Math.random() < .5) {
            newNotification.type = "DELIVER_M";
        }
        newNotification.save(function (err) {
            if (err) // TODO handle the error
                console.log('Could not create new event')
        });
    };

    var executeEvents = function () {
        var tmw = Date.tomorrow();
        model.Event
            .find()
            .where('executed').equals(false)
            .exec(function (err, events) {
                if (err) {
                    console.log('Error retrieving events.')
                }
                if (events) {
                    for (var i = 0; i < events.length; i++) {
                        var ev = events[i];
                        if (ev.date < Date.now()) {
                            if (ev.type == "DELIVER") {
                                model.getOrCreatePlayer(ev.avatarId, function (p) {
                                    p.status = "NORMAL";
                                    createDeliveryNotification(p.avatarId);
                                    p.update();
                                });
                                ev.executed = true;
                                ev.save();
                            }
                        }
                    }
                }
            });
    };

    var cronJob = cron.CronJob;
    new cronJob('0 0 * * *', function () {
        executeEvents();
    }, null, true, "America/Los_Angeles");

    server.get(/process/,
        function (req, res) {
            executeEvents();
            res.send("OK")
        }
    );

    server.get('/breeding/action',
        function (req, res) {
            var action = req.query.action;
            var id = util.getId([req.headers,req.query]);

            model.getOrCreatePlayer(id, function (p) {
                if (action == "breed") {
                    var target = req.query.target;
                    model.getOrCreatePlayer(target, function (targetPlayer) {
                        if (target != id && targetPlayer.gender == "FEMALE") {
                            if (targetPlayer.status != "PREGNANT" && Math.random() < .15) {
                                targetPlayer.status = "PREGNANT";
                                createDeliveryEvent(target);
                                targetPlayer.save();
                            }
                        }
                    });
                    res.send(p.status);
                }
                if (action == "takeseed") {
                    var target = req.query.target;
                    model.getOrCreatePlayer(target, function (targetPlayer) {
                        if (target != id && targetPlayer.gender == "MALE") {
                            if (p.status != "PREGNANT" && Math.random() < .15) {
                                createDeliveryEvent(id);
                                p.status = "PREGNANT";
                                p.save();
                            }
                        }
                    });
                    res.send(p.status);
                }
                else {
                    res.send(p.status);
                }
            });
        }
    );
});