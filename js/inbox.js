(function () {
    var UI;

    function Inbox() {
        UI = new Dialog()
            .setTitle('Inbox Archiver (prototype)')
            .setSummary('Hi! I\'m a tool to help <em>you</em> save <em>your</em> Facebook messages.')
            .setBody('<ol>' +
                         '<li>Get them.</li>' +
                         '<li>Put them on single page that you can save.</li>' +
                         '<li>??</li>' +
                         '<li>Profit.</li>' +
                     '</ol>' +
                     '<p>I work in your browser. I respect your privacy. I send <strong>nothing</strong> to anyone except you.</p>')
            .setButtons([Dialog.NEXT, Dialog.CANCEL])
            .setHandler(UI_Download)
            .show();
    }

    function UI_Download() {
        var index = {inbox: null, sent: null};

        UI = new Dialog()
            .setTitle('Indexing your messages...')
            .setBody('<p>I\'m going through your inbox, making sure I won\'t miss a thing.</p>')
            .setModal(true, Dialog.MODALITY.DARK)
            .show();

        /* TODO: Get hacky and trigger .setTitleLoading() after the dialog renders. */

        getFolderSummaries('[fb]messages', function (summaries) {
            index.inbox = summaries;

            UI.setBody('<p>Now, I\'m doing the same with your sent box.</p><p>Wouldn\'t want to forget those!');

            getFolderSummaries('[fb]sent', function (summaries) {
                index.sent = summaries;
                _get_messages();
            }, function (error) {
                new ErrorDialog().showError('You should try again. Later.',
                                            'Something went wrong with indexing your sent box.');
            });
        }, function (error) {
            new ErrorDialog().showError('You should try again. Later.',
                                        'Something went wrong with indexing your inbox.');
        });

        function _get_messages() {
            var ids = {};

            /* Get an array of all threadIds by merging both the inbox and sent summaries. */
            function __s_tid_merge(s) {
                ids[s.threadId] = null;
            }
            index.inbox.forEach(__s_tid_merge);
            index.sent.forEach(__s_tid_merge);
            ids = keys(ids);

            UI.setTitle('Downloading...')
                .setBody('Got <strong id="fbarchiver-inbox-count">0</strong> messages of your ' + ids.length + ' messages.');

            getThreads(ids, function (threads, threads_length) {
                UI.setBody('Got all <strong>' + threads_length + '</strong> of them messages. Whew. OK, ready to archive them?')
                    .setButtons([Dialog.NEXT, Dialog.CANCEL])
                    .setHandler(function () {
                        UI_Archive(index, threads);
                    });
            }, function (error) {
                new ErrorDialog().showError('You should try again. Later.',
                                            'Something went wrong getting your messages.');
            });
        }
    }

    function getFolderSummaries(folder, summariesHandler, errorHandler) {
        var summaries = [];

        function _nextPage(start) {
            new AsyncRequest('/ajax/gigaboxx/endpoint/ListThreads.php')
                .setData({start: start, limit: 100, folder: folder})
                .setReadOnly(true)
                .setHandler(function (data) {
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

    function getThreads(ids, threadHandler, errorHandler) {
        var threads = {},
            threads_length = 0;

        ids.forEach(function (threadId) {
            new AsyncRequest('/ajax/gigaboxx/endpoint/ReadThread.php')
                .setData({tid: threadId})
                .setReadOnly(true)
                .setHandler(function (data) {
                    threads[threadId] = data.getPayload().thread;
                    threads_length++;

                    if (threads_length < ids.length) {
                        /* TODO: Move this into UI_Archive. */
                        $('fbarchiver-inbox-count').innerHTML = threads_length;
                    } else {
                        threadHandler(threads, threads_length);
                    }
                })
                .setErrorHandler(errorHandler)
                .send();
        });
    }

    function UI_Archive(index, threads) {
        var messages_uri = new URI($('fbarchiver-inbox').src).setPath('/inbox.html'),
            child_uri = messages_uri.getQualifiedURI().setPath('');

        window.addEventListener('message', function (event) {
            var event_uri = new URI(event.origin);

            if (event_uri.toString() === child_uri.toString()) {
                /* TODO: Get the person's name over. */
                event.source.postMessage(JSON.encode([index, threads]), event.origin);
            }
        }, false);
        window.open(messages_uri.toString(), 'messages');
    }

    /* Load, even if the bookmarklet is pressed before the entire page is loaded. */
    if ((/(facebook\.com)/).test(document.location.host)) {
        if (window.loaded) {
            Inbox();
        } else {
            onafterloadRegister(Inbox);
        }
    }
})();
