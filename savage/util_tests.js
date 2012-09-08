define(['vows', 'assert', 'savage/util'], function (vows, assert, util) {
    vows.describe('Can get context data').addBatch({
        'Can get a default position if none provided':{
            topic:function () {
                return util.getPosition({})
            },

            'we get the default position':function (topic) {
                assert.equal(topic, util.DEFAULT_POSITION);
            }
        },
        'Can get a position if provided by second life header':{
            topic:function () {
                return util.getPosition({
                    "x-secondlife-local-position":"(173.0098, 75.5512, 60.9500)"
                })
            },

            'we get the position':function (topic) {
                var expected = [173.0098, 75.5512, 60.9500];
                assert.equal(topic[0], expected[0]);
                assert.equal(topic[1], expected[1]);
                assert.equal(topic[2], expected[2]);
            }
        },
        'Can get a position if provided by query string "sim"':{
            topic:function () {
                return util.getPosition({
                    "position":"(173.0098, 75.5512, 60.9500)"
                })
            },

            'we get the positione':function (topic) {
                var expected = [173.0098, 75.5512, 60.9500];
                assert.equal(topic[0], expected[0]);
                assert.equal(topic[1], expected[1]);
                assert.equal(topic[2], expected[2]);
            }
        },
        'Can get a default sim name if none provided':{
            topic:function () {
                return util.getSim({})
            },

            'we get the default sim name':function (topic) {
                assert.equal(topic, util.DEFAULT_SIM);
            }
        },
        'Can get a sim name if provided by second life header':{
            topic:function () {
                return util.getSim({
                    "x-secondlife-region":"Sexy"
                })
            },

            'we get the sim name':function (topic) {
                assert.equal(topic, "Sexy");
            }
        },
        'Can get a sim name if provided by query string "sim"':{
            topic:function () {
                return util.getSim({
                    "sim":"Sexy"
                })
            },

            'we get the sim name':function (topic) {
                assert.equal(topic, "Sexy");
            }
        },
        'Can get a sim name if provided by query string "sim 123"':{
            topic:function () {
                return util.getSim({
                    "sim":"Sexy (123)"
                })
            },

            'we get the sim name':function (topic) {
                assert.equal(topic, "Sexy");
            }
        },
        'Can get a default avatar name if none provided':{
            topic:function () {
                return util.getName({})
            },

            'we get the default avatar name':function (topic) {
                assert.equal(topic, util.DEFAULT_AVATAR_NAME);
            }
        },
        'Can get a avatar name if provided by second life header':{
            topic:function () {
                return util.getName({
                    "x-secondlife-owner-name":"Syntax"
                })
            },

            'we get the avatar name':function (topic) {
                assert.equal(topic, "Syntax");
            }
        },
        'Can get a avatar name if provided by query string "avatar_name"':{
            topic:function () {
                return util.getName({
                    "avatar_name":"Syntax"
                })
            },

            'we get the avatar name':function (topic) {
                assert.equal(topic, "Syntax");
            }
        },
        'Can get a default avatar id if none provided':{
            topic:function () {
                return util.getId({})
            },

            'we get the default avatar id':function (topic) {
                assert.equal(topic, util.DEFAULT_AVATAR_ID);
            }
        },
        'Can get a avatar id if provided by second life header':{
            topic:function () {
                return util.getId({
                    "x-secondlife-owner-key":"123"
                })
            },

            'we get the avatar id':function (topic) {
                assert.equal(topic, "123");
            }
        },
        'Can get a avatar id if provided by query string "avatarId"':{
            topic:function () {
                return util.getId({
                    "avatarId":"abc"
                })
            },

            'we get the avatar id':function (topic) {
                assert.equal(topic, "abc");
            }
        }
    })
});