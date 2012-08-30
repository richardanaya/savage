var requirejs = require('requirejs');

requirejs.config({
    nodeRequire:require
});

requirejs(
    [
        'savage/services/game',
        'savage/services/crafting',
        'savage/services/breeding',
        'savage/services/tribe',
        'savage/services/notification'
    ],
    function (server) {
    }
);