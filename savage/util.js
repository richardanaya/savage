define(function () {
    var obj = {
        DEFAULT_AVATAR_ID:"01234567-89ab-cdef-0123-456789abcdef",
        DEFAULT_AVATAR_NAME:"???",
        DEFAULT_SIM:"Test",
        DEFAULT_POSITION:[0, 0, 0],
        getId:function (data) {
            return data['x-secondlife-owner-key'] || data['avatar_id'] || obj.DEFAULT_AVATAR_ID;
        },
        getName:function (data) {
            return data['x-secondlife-owner-name'] || data['avatar_name'] || obj.DEFAULT_AVATAR_NAME;
        },
        getSim:function (data) {
            return data['x-secondlife-region'] || data['sim'] || obj.DEFAULT_SIM;
        },
        getPosition:function (data) {
            if (data['x-secondlife-local-position'] || data['position']) {
                var dataString = data['x-secondlife-local-position'] || data['position'];
                dataString = dataString.substring(1, dataString.length - 1);
                var components = dataString.split(',');
                return  [parseFloat(components[0].trim()), parseFloat(components[1].trim()), parseFloat(components[2].trim())];
            }
            else {
                return  obj.DEFAULT_POSITION;
            }
        },
        randomElement:function (arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        }
    };
    return obj;
});