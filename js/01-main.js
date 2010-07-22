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
		var output = '<html>';
		
		output += '<head>' +
			'<title>Your Facebook Messages</title>' +	/* TODO: What's the person's name? */
			'</head>';

		output += '<body>' +
			'<h1>Inbox</h1>';

		output += '<ul>';
		threads.forEach(function(t) {
			output += '<li id="index-' + t.summary.threadId + '">' +
				'<img class="icon" alt="' + t.summary.icon.alt + '" src="' + t.summary.icon.image + '" />' +
				'<span class="from name"><a href="' + t.summary.icon.href + '">' + t.summary.icon.alt + '</a></span>' +
				'<span class="date">' + t.summary.timeLastUpdatedRendered + '</span>' +
				'<span class="subject">' + (t.summary.subject || '(no subject)') + '</span>' +
				'<span class="snippet">' + t.summary.snippet + '</span>' +
				/* TODO: Render the full message. */
				'</li>';
		});
		output += '</ul>';

		/* TODO: Sent */

		output += '</body>';

		/*
		 * Option 1 gives a consistent DOM that Chrome lets me examine.
		 * Option 2 gives some sort of transient document that is impervious to any examination.
		 *
		 * Can't save either, though.
		 */
		if (true) {
			window.open('data:text/html;charset=utf-8;base64,' + $.base64Encode(output), 'inbox');
		} else {
			var d = window.open().document;
			d.write(output);
			d.close();
		}
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
					.setHandler(function() { UI_Archive(threads); });	/* Could use setUserData here, but eww. */
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
