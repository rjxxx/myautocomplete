(function($ ){

    $.fn.myautocomplete = function(options) {

        this.isShowList = false;

        this.options = $.extend({
            limit: 5,
            selectPlaceholder: 'Начните вводить',
            errorMsg: 'Ошибка, выберите город из списка',
            notFoundMsg: 'Не найдено',
            data: [],
            filename: 'kladr.json',
            value: null,
            func: null
        }, options );

        if(this.length > 1) {
            this.each(function(){
                $(this).myautocomplete(options);
            });
            return this;
        }


        this._init = function() {



            //оборачиваем input в div
            self.wrap($('<div class="my-wrap"></div>'));

            //сохранием этот div
            self._wrap = self.closest('.my-wrap');

            //добавляем еще один div, где будет выпадающий список
            self._wrap.append('<div class="my-lists" style="display: none"></div>');

            //и тоже сохраняем
            self._lists = self._wrap.children('.my-lists');

            self._input = self;

            self.attr('placeholder', self.options.selectPlaceholder);

            self._wrap.append('<div class="my-error" style="display: none">' + self.options.errorMsg + '</div>');

            self._error = self._wrap.children('.my-error');


            self._input.on('keydown', function(event) {
                if(event.keyCode == 40 || event.keyCode == 38) {

                    event.stopPropagation();
                    event.preventDefault();
                    self.navigate(event.keyCode == 40);
                }
                else if(event.keyCode == 27) {
                    self.hideList();
                    self.isShowList = true;
                }
                else if(event.keyCode == 13) {
                    self.selectItem();
                }

            });

            self._wrap.on('mouseover', '.my-item', function(e) {
                self._wrap.find('.my-item').removeClass('active');
                if (!$(this).hasClass('deactivе')) {
                    $(this).addClass('active');
                }
            });

            self._input.on('input', function(){

                if (self.isShowList && self.val().length == 0)
                {
                    self.hideList();
                    return;
                }

                self.showList(self.search(self.val()));
                self.navigate(true);
                self.isItemSelected = false;
            });

            self._input.on('focus', function(e){

                self.onEvent('focused');
                if (self.val().length > 0) {
                    self.showList(self.search(self.val()));
                    self.navigate(true);
                }
                e.stopPropagation();
            });

            self._input.on('click', function (e) {
                e.stopPropagation();
            });


            self._input.on('focusout', function(e){
                if (self.val().length == 0) {
                    self.onEvent('resetstyle');
                }
            });


            self._lists.on('click', 'div', function (e) {
                if ($(this).hasClass('deactivе')) {
                    e.stopPropagation();
                    return;
                }

                self._input.val($(this).text());
                self.hideList();
                self.isItemSelected = true;
                self.onEvent('resetstyle');
                e.stopPropagation();
            });

            $('body').on('click', function(e){
                if (self.isShowList) {
                    self.hideList();

                    let items = self.search(self.val());
                    if (items.length != 0 && items[0].val == self.val().trim()) {
                            self.onEvent('itemselected');
                            self.isItemSelected = true;
                    } else {
                        self.onEvent('itemnotselected');
                        self.isItemSelected = false;
                    }
                }


            });
        };

        this.loadJson = function () {
            $.getJSON(self.options.filename, function (data) {
                self.items = [];
                $.each(data, function (key, val) {
                    let item = {};
                    item['key'] = val.Id;
                    item['val'] = val.City;
                    self.items.push(item);
                });
            });
        };

        this.search = function (string) {

            if (string == '')
                return [];

            let newList = [];
            let str = string.toLocaleLowerCase();
            let count = 0;
            $.each(self.items, function (key, val) {
                if (val.val.toLocaleLowerCase().indexOf(str) == 0)
                {
                    if (count >= self.options.limit)
                        return;
                    newList.push(val);
                    count++;
                }

            });
            if (newList.length == 0)
            {
                return [];
            }
            return newList;
        };

        this.showList = function(items) {
            let newItem = "";
            if (items.length == 0)
            {
                newItem = '<div class="my-item deactivе" data-id="-1">' + self.options.notFoundMsg + '</div>'
            }
            for (let i = 0; i < items.length; i++) {
                newItem += '<div class="my-item" data-id="' + items[i].key + '">' + items[i].val + '</div>';
            }
            self._lists.html(newItem);
            self._lists.show();
            self.isShowList = true;
        };


        this.hideList = function() {

            self._lists.hide();
            self._lists.html("");
            self.isShowList = false;
        };

        this.navigate = function(down) {
            if (self._lists.find('.my-item.deactivе').length != 0) {
                return;
            }

            let current = self._lists.find('.my-item.active');
            let select = null;
            if(down) {
                select = current.length ? current.next('.my-item') : self._wrap.find('.my-item:first');
            }
            else {
                select = current.length ? current.prev('.my-item') : self._wrap.find('.my-item:last');
            }
            self._lists.find('.my-item').removeClass('active');
            select.addClass('active');
        };

        this.selectItem = function() {
            let current = self._wrap.find('.my-item.active');
            if(current.length) {

                self._input.val(current[0].innerText);
                self.hideList();
                self.onEvent('itemselected');
            }
        };

        this.onEvent = function (event) {
            switch (event) {
                case 'focused':
                    self.css('border', '2px solid #5099DB');
                    self._error.css('display','none');
                    break;

                case 'itemselected':
                case 'resetstyle':
                    self.css('border', '2px solid #404040');
                    self._error.css('display','none');
                    break;

                case 'itemnotselected':
                    self.css('border', '2px solid #E3071C');
                    self._error.css('display','block');
                    break;
                default:
                    break
            }

        };


        //сохрняем ссылку на input
        let self = this;
        this._init();
        this.loadJson();
    };

})( jQuery );