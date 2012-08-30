define(['savage/server', 'savage/model' , 'savage/store', 'savage/util'], function (server, model, store, util) {
    server.get('/tribe/find',
        function (req, res) {
            var id = util.getId(req.query);
            var tool = req.query.tool;
            var location = util.getSim(req);
            var location = util.getLocation(req);
        }
    );
});