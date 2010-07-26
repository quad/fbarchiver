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
