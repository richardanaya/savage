var requirejs = require('requirejs');

requirejs.config({
    nodeRequire:require
});

requirejs(
    [
        'date-utils',
        'savage/services/game',
        'savage/services/crafting',
        'savage/services/breeding',
        'savage/services/tribe',
        'savage/services/notification',
        'savage/services/divine'
    ],
    function (server) {
    }
);