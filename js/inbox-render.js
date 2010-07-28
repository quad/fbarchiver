var FACEBOOK_ORIGIN = 'http://www.facebook.com';

$(function () {
    window.addEventListener('message', onMessage, false);
    window.opener.postMessage('ready', FACEBOOK_ORIGIN);
});

function onMessage(event) {
    if (event.origin === FACEBOOK_ORIGIN) {
        var m = $.parseJSON(event.data),
            index = m[0],
            threads = m[1];

        renderFolder($('#inbox'), index.inbox, threads);
        renderFolder($('#sent'), index.sent, threads);
    }
}

function renderFolder(table, summaries, threads)
{
    summaries.forEach(function (s) {
        var t = threads[s.threadId],
            r;

        /* Render summary. */
        r = '<tr class="meta" id="meta-' + s.threadId + '">' +
                '<td class="face">' +
                    '<a href="' + s.icon.href + '">' +
                        '<img class="icon" alt="' + s.icon.alt + '" src="' + s.icon.image + '" />' +
                    '</a>' +
                '</td>' +
                '<td class="who">' +
                    '<a href="' + s.icon.href + '">' +
                        '<span class="name">' + s.icon.alt + '</span>' +
                    '</a>' +
                    '<span class="date">' + s.timeLastUpdatedRendered + '</span>' +
                '<td class="what">' +
                    '<span class="subject">' + (s.subject || '(no subject)') + '</span>' +
                    '<span class="snippet">' + s.snippet + '</span>' +
                '</td>' +
            '</tr>';

        /* Render the thread. */
        r += '<tr class="thread" id="thread-' + t.threadId + '">' +
                 '<td colspan="3">' +
                    '<div class="header">' +
                        '<span class="authors">' + t.renderedAuthorList + '</span>' +
                    '</div>';

        if (t.messages) {
            t.messages.forEach(function (m) {
                r += '<table class="message">' +
                         '<tr>' +
                             '<td class="face">' +
                                 '<a href="' + m.author.href + '">' +
                                     '<img class="icon" alt="' + m.author.name + '" src="' + m.author.picture + '" />' +
                                 '</a>' +
                             '</td>' +
                             '<td class="body">' +
                                '<span class="from">' + m.author.name + '</span>' +
                                '&nbsp;' +
                                '<span class="date">' + m.time_rendered + '</span>' +
                                '<div class="message">' + m.message + '</div>' +
                             '</td>' +
                         '</tr>' +
                     '</table>';
            });
        }

        r += '</td>' + '</tr>';

        table.append(r);
    });
}
