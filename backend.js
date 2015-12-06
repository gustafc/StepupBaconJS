'use strict';
var Backend = (function() {
    function somewhatDelayed(promise) {
        function delay(sink, value) {
            setTimeout(function () {
                sink(value);
            }, 100 + Math.random() * 900);
        }
        return new Promise(function(resolve, reject) {
            promise.then(v => delay(resolve, v), e => delay(reject, e));
        });
    }
    var vegetable = name => ({name, category: 'vegetable'}),
        meat      = name => ({name, category: 'meat'}),
        funghi    = name => ({name, category: 'funghi'});
    var items = [
        vegetable('Broccoli'),
        vegetable('Morot'),
        vegetable('Majrova'),
        vegetable('Sallad'),
        vegetable('Spenat'),
        funghi('Karl-johansvamp'),
        funghi('Kantarell'),
        funghi('Champinjon'),
        funghi('Shiitake'),
        meat('Entrecote'),
        meat('Skinka'),
        meat('Bacon'),
        meat('Högrev'),
    ];
    function matchesSearch(params, item) {
        return (!params.category || params.category === item.category)
            && item.name.toLowerCase().indexOf(params.query.toLowerCase()) > -1;
    }
    function compare(a, b) {
        return a < b ? -1 : (a === b ? 0 : 1);
    }
    return {
        search: params => somewhatDelayed(new Promise(function(resolve, reject) {
            console.log('Searching for', params.query, 'in', params.section || '(all sections)');
            var err = /error (.+)/.exec(params.query);
            if (err) throw new Error(err[1]);
            var result = items
                .filter(e => matchesSearch(params, e))
                .sort((a, b) => compare(a.name, b.name));
            resolve({result, params});
        }))
    };
}());
