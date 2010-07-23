(function($) {
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
                        }
                        else {
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
                        UI.setBody('Got <strong>' + threads.length + '</strong> messages of your ' + summaries.length + ' messages.')
                            .setTitleLoading(true);
                    } else {
                        threadHandler(threads);
                    }
                })
                .setErrorHandler(errorHandler)
                .send();
        });
    }

    function UI_Archive(threads) {
        var output = window.open('', 'inbox').document;

        output.write('<html>');
        
        output.write('<head>' +
                     '<title>Your Facebook Messages</title>' +    /* TODO: What's the person's name? */
                     '</head>');

        output.write('<body>');

        output.write('<h1>Inbox</h1>');

        output.write('<ul>');
        threads.forEach(function(t) {
            /* Render summary. */
            output.write('<li id="index-' + t.summary.threadId + '">' +
                             '<a href="' + t.summary.icon.href + '">' +
                                 '<img class="icon" alt="' + t.summary.icon.alt + '" src="' + t.summary.icon.image + '" />' +
                                 '<span class="from">' + t.summary.icon.alt + '</span>' +
                             '</a>' +
                             '<span class="date">' + t.summary.timeLastUpdatedRendered + '</span>' +
                             '<span class="subject">' + (t.summary.subject || '(no subject)') + '</span>' +
                             '<span class="snippet">' + t.summary.snippet + '</span>');

            /* Render the thread. */
            output.write('<div class="thread">' +
                             '<span class="subject">' + t.thread.subject + '</span>' +
                             '<span class="authors">' + t.thread.renderedAuthorList + '</span>');

            if (t.thread.messages) {
                t.thread.messages.forEach(function(m) {
                    output.write('<div class="message">' +
                                     '<a href="' + m.author.href + '">' +
                                         '<img class="icon" alt="' + m.author.name + '" src="' + m.author.picture + '" />' +
                                         '<span class="from">' + m.author.name + '</span>' +
                                     '</a>' +
                                     '<span class="date">' + m.time_rendered + '</span>' +
                                     '<span class="message">' + m.message + '</span>' +
                                 '</div>');
                });
            }

            output.write('</div>');

            output.write('</li>');
        });
        output.write('</ul>');

        /* TODO: Sent */

        output.write('</body>');

        output.write('</html>');
        output.close();

        /* Another interesting option, that crashes Chrome, is:
               window.open('data:text/html;charset=utf-8;base64,' + $.base64Encode(output), 'inbox'); */
    }

    function UI_Download() {
        UI = new Dialog()
            .setTitle('Downloading...')
            .setModal(true, Dialog.MODALITY.DARK)
            .setImmediateRendering(true)
            .showLoading();

        GetInboxSummaries(function(summaries) {
            UI.show();

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
             '<li>Profit.</li></ol>')
        .setButtons([Dialog.NEXT, Dialog.CANCEL])
        .setHandler(UI_Download);

    UI.show();
})(jQuery.noConflict());
