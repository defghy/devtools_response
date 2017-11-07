require("./init.js");
require("./index.less");
require("./reqlist/list.js");

var tpl = require("./index.string");

var app = window.app = new Vue({
    el: "#container",
    template: tpl,
    data: function() {
        var reqSwitch = window.localStorage.getItem("reqSwitch");
        reqSwitch = reqSwitch == "true"? true: false;
        return {
            filterText: "",
            reqSwitch: reqSwitch
        };
    },
    watch: {

    },
    methods: {
        clearList: function() {
            var me = this;
            eventCenter.$emit("listClear");
        },
        changeReqSwitch: function() {
            var me = this;
            me.reqSwitch = !me.reqSwitch;
            window.localStorage.setItem("reqSwitch", me.reqSwitch);
        }
    }
});

window.axios = require('axios');
var io = require("socket.io-client");
window.test = {
    api: function() {
        axios({
            method: 'GET',
            url: '/api'
        }).then(function(res) {
            console.log(JSON.stringify(res.data));
        }).catch(function() {
            debugger;
        });

        axios({
            method: 'GET',
            url: '/bind/lvmiHotelList'
        }).then(function(res) {
            console.log(JSON.stringify(res.data));
        }).catch(function() {
            debugger;
        });
    },
    socket: function() {
        // websocket
        var socket = io(window.location.href, {
            'path' : '/push',
            'reconnectionDelay': 500,
            'reconnectionDelayMax': 60000
        });

        socket.on('connect', function() {

            debugger;

        });

        socket.on('push', function(data) {
            debugger;
        });
    }
};




// 初始化
chrome.devtools.panels.create('Response', 'logo.png',
    'devtools.html', function (panel) {
        // panel loaded
        debugger;
    }
);
