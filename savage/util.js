define(function () {
    var obj = {
        DEFAULT_AVATAR_ID:"01234567-89ab-cdef-0123-456789abcdef",
        DEFAULT_AVATAR_NAME:"???",
        DEFAULT_SIM:"Test",
        DEFAULT_POSITION:[0, 0, 0],
        getId:function (data) {
            var dataSources = [];

            if(Array.isArray(data)){
                dataSources = data;
            }
            else {
                dataSources.push(data);
            }

            for(var i = 0 ; i < dataSources.length; i++){
                var d = dataSources[i];
                if(d['x-secondlife-owner-key'] || d['avatarId']){
                    return d['x-secondlife-owner-key'] || d['avatarId'];
                }
            }
            return  obj.DEFAULT_AVATAR_ID;
        },
        getName:function (data) {
            var dataSources = [];

            if(Array.isArray(data)){
                dataSources = data;
            }
            else {
                dataSources.push(data);
            }

            for(var i = 0 ; i < dataSources.length; i++){
                var d = dataSources[i];
                if(d['x-secondlife-owner-name'] || d['avatar_name']){
                    return d['x-secondlife-owner-name'] || d['avatar_name'];
                }
            }
            return  obj.DEFAULT_AVATAR_NAME;
        },
        getSim:function (data) {
            var dataSources = [];

            if(Array.isArray(data)){
                dataSources = data;
            }
            else {
                dataSources.push(data);
            }

            for(var i = 0 ; i < dataSources.length; i++){
                var d = dataSources[i];
                if(d['x-secondlife-region'] || d['sim']){
                    var sim =  d['x-secondlife-region'] || d['sim'];
                    if(sim.indexOf('(')!= -1) {
                        sim = sim.substr(0,sim.indexOf('(')-1);
                    }
                    sim = sim.trim();
                    return sim
                }
            }
            return  obj.DEFAULT_SIM;
        },
        getPosition:function (data) {
            var dataSources = [];

            if(Array.isArray(data)){
                dataSources = data;
            }
            else {
                dataSources.push(data);
            }

            for(var i = 0 ; i < dataSources.length; i++){
                var d = dataSources[i];
                if(d['x-secondlife-local-position'] || d['position']){
                    var dataString = d['x-secondlife-local-position'] || d['position'];
                    dataString = dataString.substring(1, dataString.length - 1);
                    var components = dataString.split(',');
                    return  [parseFloat(components[0].trim()), parseFloat(components[1].trim()), parseFloat(components[2].trim())];
                }
            }
            return  obj.DEFAULT_POSITION;
        },
        randomElement:function (arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        }
    };
    return obj;
});