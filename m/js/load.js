var FACEBOOK_ORIGIN = 'http://www.facebook.com';

$(function() {
    window.addEventListener('message', onMessage, false);
    window.opener.postMessage('ready', FACEBOOK_ORIGIN);
});

function onMessage(event) {
    if (event.origin === FACEBOOK_ORIGIN) {
        var t = $.parseJSON(event.data);

        $('#inbox').append(function() {
            /* Render summary. */
            r = '<tr class="meta" id="meta-' + t.summary.threadId + '">'
                  + '<td class="face">'
                      + '<a href="' + t.summary.icon.href + '">'
                      +     '<img class="icon" alt="' + t.summary.icon.alt + '" src="' + t.summary.icon.image + '" />'
                      + '</a>'
                  + '</td>'
                  + '<td class="who">'
                      + '<a href="' + t.summary.icon.href + '">'
                          + '<span class="name">' + t.summary.icon.alt + '</span>'
                      + '</a>'
                      + '<span class="date">' + t.summary.timeLastUpdatedRendered + '</span>'
                  + '<td class="what">'
                      + '<span class="subject">' + (t.summary.subject || '(no subject)') + '</span>'
                      + '<span class="snippet">' + t.summary.snippet + '</span>'
                  + '</td>'
              + '</tr>';

            /* Render the thread. */
            r += '<tr class="thread" id="thread-' + t.thread.threadId + '">'
                   + '<td colspan="3">'
                      + '<div class="header">'
                          + '<span class="authors">' + t.thread.renderedAuthorList + '</span>'
                      + '</div>';

            if (t.thread.messages) {
                t.thread.messages.forEach(function(m) {
                    r += '<table class="message">'
                           + '<tr>'
                               + '<td class="face">'
                                   + '<a href="' + m.author.href + '">'
                                       + '<img class="icon" alt="' + m.author.name + '" src="' + m.author.picture + '" />'
                                   + '</a>'
                               + '</td>'
                               + '<td class="body">'
                                  + '<span class="from">' + m.author.name + '</span>'
                                  + '&nbsp;'
                                  + '<span class="date">' + m.time_rendered + '</span>'
                                  + '<div class="message">' + m.message + '</div>'
                               + '</td>'
                           + '</tr>';
                       + '</table>';
                });
            }

            r += '</td>' + '</tr>';

            return r;
        });
    }
}
