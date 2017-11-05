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

// 初始化
chrome.devtools.panels.create('Response', 'logo.png',
    'devtools.html', function (panel) {
        // panel loaded
        debugger;
    }
);
