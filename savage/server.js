define(['express',"jinjs","pwilang",'module','path'],function(express,jinjs,pwilang,module,path){
    jinjs.registerExtension(".tpl");
    jinjs.registerExtension(".pwx", function (txt) {
        return pwilang.parse(txt);
    });

    var __filename = module.uri;
    var __dirname = path.dirname(__filename);

    var authorize = function (username, password) {
        //return 'someone' === username & 'password' === password;
        return true;
    };

    var server = express.createServer(
        //express.basicAuth(authorize)
    );

    server.configure(
        function() {
            server.use(express.static(__dirname + '/../static/'));
            server.set("views", __dirname + '/../pages/');
            server.set("view options", { jinjs_pre_compile: function (str) { return parse_pwilang(str); } });
            server.set("view options", { layout: false });
        }
    );

    var port = process.env.PORT || 9999;
    server.listen(port);
    console.log('Listening on port '+port);
    return server;
});