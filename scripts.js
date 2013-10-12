xtag.register('x-autocomplete', {
    extends: 'input',
    lifecycle: {
        created: function(){
            this.loadData();
        },
        inserted: function () {
            this.createList();
        },
    },
    accessors: {
        languages : {
            get : function () {
                return this.jsonData;
            },
            set : function (json) {
                this.jsonData = json;
            }
        }
    },
    events: {
        'keyup' : function () {
            var self = this;
            if (this.value.length < this.getAttribute("minlength")) {
                this.hideList();
                return;
            }
            clearTimeout(this.timeout);
            this.timeout = setTimeout(function () {
                var items = self.search(self.value);
                if (items.length > 0) {
                    self.repopulateList(items);
                } else {
                    self.hideList();
                }
            }, this.getAttribute('waitforuser'))
        }
    },
    methods: {
        loadData: function () {
            var self = this;
            return ajax(this.getAttribute("source"), function (response) {
                self.languages = JSON.parse(response);
            });
        },
        search: function (str) {
            var i, result = [];
            for (i=0;i<this.languages.length;i++) {
                if (this.languages[i].name.indexOf(str) > -1) {
                    result.push(this.languages[i]);
                }
            }
            return result;
        },
        createList: function () {
            var self = this;
            var list = document.createElement('ul');
            this.hideList();
            var rect = this.getBoundingClientRect();
            list.style.top = (rect.top+25)+"px";
            list.style.left = rect.left+"px";
            this.parentNode.insertBefore(list, this);

            xtag.addEvent(list, 'click:delegate(li)', function () {
                self.value = this.innerHTML;
                self.hideList();
            });
        },
        repopulateList: function (items) {
            var li, i, list = this.previousSibling;

            this.emptyList();

            for (i=0;i<items.length;i++) {
                li = document.createElement('li');
                li.innerHTML = items[i].name;
                li.setAttribute('data-id', items[i].id);

                list.appendChild(li);

            }

            this.showList();
        },
        emptyList: function () {
            var list = this.previousSibling;
            while (list.hasChildNodes()) {
                list.removeChild(list.lastChild);
            }
        },
        showList: function () {
            this.previousSibling.className = 'x-autocomplete-list';
        },
        hideList: function () {
            this.previousSibling.className = 'x-autocomplete-list hidden';
        }
    }
});


function ajax(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
     xhr.onreadystatechange = function () {
        if (xhr.readyState < 4 || xhr.status !== 200) {
            return;
        } else if (xhr.readyState === 4) {
            callback(xhr.responseText);
        }
     };
    xhr.send('');

    return xhr;
}