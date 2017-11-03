var tpl = require("./list.string");
require("./list.less");

var totalReqs = [];

var _util = {
    vm: null,
    filter: function(text) {
        if(!text) {
            return totalReqs.concat([]);
        }

        return totalReqs.filter(function(r) {
            return (r.resHeaders && r.resHeaders.includes(text))
                || (r.body && r.body.includes(text));
        });
    },
    onRequest: function(network) {
        var me = _util.vm;

        var req = network.request,
            res = network.response;

        try {
            var item = {
                url: req.url,
                host: (req.url.match(/\/\/([\w\.]+)\//) || {})[1] || "",
                pathname: (req.url.match(/(\/[^\/]*)$/) || {})[1] || "",
                reqHeaders: JSON.stringify(req.headers),
                resHeaders: JSON.stringify(res.headers)
            };
            totalReqs.push(item);
            me.list.push(item);
        } catch(e) {
            console.log(e, network);
        }


        // 获取response的数据
        network.getContent(function(data, codeType) {
            if(codeType != "base64") { // 非资源文件
                item.body = data;
            }
        });
    }
};

Vue.component('reqlist', {
    template: tpl,
    props: ["reqSwitch", "filterText"],
    data: function() {
        var me = this;
        return {
            list: []
        };
    },
    watch: {
        "reqSwitch": function(n, o) {
            var me = this;
            chrome.devtools.network.onRequestFinished[
                n? "addListener": "removeListener"](_util.onRequest);
        },
        "filterText": function(n, o) {
            var me = this;
            me.list = _util.filter(n);
        }
    },
    computed: {

    },
    methods: {
        changeVCode: function() {
            _util.getVCode(this);
        },
        changeShowPasswd: function() {
            this.showPassword = !this.showPassword;
        }
    },
    mounted: function() {
        var me = _util.vm = this;
        chrome.devtools.network.onRequestFinished[
            me.reqSwitch? "addListener": "removeListener"](_util.onRequest);
    }
});

eventCenter.$on("listClear", function() {
    totalReqs = [];
    _util.vm.list = [];
});
