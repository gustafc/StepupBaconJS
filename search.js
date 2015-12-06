function valuesBeforeAndOn($input, mutatingEvent) {
    return $input.asEventStream(mutatingEvent)
        .map(event => event.target.value)
        .merge(Bacon.once($input.val()));
}

function initSearch($form) {
    var queries = valuesBeforeAndOn($form.find('input[name=query]'), 'keyup')
        .debounce(250)
        .map(s => s.trim().replace(/\s+/g, ' '))
        .filter(s => s.length > 0)
        .skipDuplicates();
    var categories = valuesBeforeAndOn($form.find('select[name=section]'), 'change');
    var searchParams = Bacon.combineTemplate({ query: queries, category: categories });
    var searchResults = searchParams.flatMapLatest(
        params => Bacon.fromPromise(Backend.search(params)));
    searchParams.awaiting(searchResults).onValue(
        waiting => waiting && setSearchStatus($form, 'searching'));
    searchResults.onValue(results => setSearchStatus($form, 'result', results));
    searchResults.onError(e => setSearchStatus($form, 'error', e));
}

function setSearchStatus($form, status, value) {
    var $statusBox = $form.find('.search-status')
    switch (status) {
        case 'result':
            if (value.result.length === 0) {
                status = 'no-result';
                $statusBox.find('.no-result q').text(value.params.query)
            }
            $statusBox.find('.result')
                .empty()
                .append(value.result.map(item => $('<li/>').text(item.name)));
            break;
        case 'error':
            console.error('Search error:', value);
            $statusBox.find('.error .error-message').text(value.message);
            break;
    }
    $statusBox.attr('data-status', status);
}

$(() => initSearch($('form')));
