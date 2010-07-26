(function() {
    function GetInboxSummaries(summariesHandler, errorHandler) {
        var summaries = [];

        function _nextPage(start) {
            new AsyncRequest('/ajax/gigaboxx/endpoint/ListThreads.php')
                .setData({start: start, limit: 100, folder: '[fb]messages'})
                .setReadOnly(true)
                .setHandler(function(data) {
                    var old_count, new_count,
                        messages = data.getPayload().thread_list;

                    if (messages) {
                        old_count = summaries.length;
                        summaries = summaries.concat(values(messages));
                        new_count = summaries.length - old_count;

                        if (new_count > 0) {
                            _nextPage(start + new_count);
                        } else {
                            summariesHandler(summaries);
                        }
                    }
                })
                .setErrorHandler(errorHandler)
                .send();
        }

        _nextPage(0); 
    }

    function GetInboxThreads(summaries, threadHandler, errorHandler) {
        var threads = [];

        summaries.forEach(function(summary) {
            new AsyncRequest('/ajax/gigaboxx/endpoint/ReadThread.php')
                .setData({tid: summary.threadId})
                .setReadOnly(true)
                .setHandler(function(data) {
                    threads.push({summary: summary, thread: data.getPayload().thread});

                    if (threads.length < summaries.length) {
                        UI.setBody('Got <strong>' + threads.length + '</strong> messages of your ' + summaries.length + ' messages.');
                    } else {
                        threadHandler(threads);
                    }
                })
                .setErrorHandler(errorHandler)
                .send();
        });
    }

    function UI_Archive(threads) {
        var messages_uri = new URI($('mybook').src).setPath('/m/'),
            child_uri = messages_uri.getQualifiedURI().setPath('');

        window.addEventListener('message', function(event) {
            var event_uri = new URI(event.origin);

            if (event_uri.toString() === child_uri.toString()) {
                /* TODO: Get the person's name over. */

                threads.forEach(function(t) {
                    event.source.postMessage(JSON.encode(t), event.origin);
                });
            }
        }, false);
        window.open(messages_uri.toString(), 'messages');
    }

    function UI_Download() {
        UI = new Dialog()
            .setTitle('Downloading...')
            .setModal(true, Dialog.MODALITY.DARK)
            .setImmediateRendering(true)
            .showLoading();

        GetInboxSummaries(function(summaries) {
            UI.show()
                .setTitleLoading(true);

            GetInboxThreads(summaries, function(threads) {
                UI.setBody('Got all <strong>' + threads.length + '</strong> of them messages. Whew. OK, ready to archive them?')
                    .setButtons([Dialog.NEXT, Dialog.CANCEL])
                    .setHandler(function() { UI_Archive(threads); });    /* Could use setUserData here, but eww. */
            }, function(error) {
                new ErrorDialog().showError('There was a problem getting your messages!');
            });
        }, function(error) {
            new ErrorDialog().showError('There was a problem getting your message index.');
        });
    }

    var UI = new Dialog()
        .setTitle('Mail (prototype)')
        .setSummary('Hi. This is a tool to help you save all your Facebook messages.')
        .setBody('<ol><li>Get them.</li>' +
             '<li>Put them on single page that you can save.</li>' +
             '<li>??</li>' +
             '<li>Profit.</li></ol>' +
             '<p><strong>NOTHING</strong> is stored on our server. Everything stays in your browser.</p>')
        .setButtons([Dialog.NEXT, Dialog.CANCEL])
        .setHandler(UI_Download);

    UI.show();
})();
