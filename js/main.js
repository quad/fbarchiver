(function($) {
	var GetInboxThreadIDs = function(idsHandler, errorHandler) {
		var ids = {length: 0};

		var _nextPage = function(start) {
			new AsyncRequest("/ajax/gigaboxx/endpoint/ListThreads.php")
				.setData({start: start, limit: 100, folder: "[fb]messages"})
				.setReadOnly(true)
				.setHandler(function(data) {
					var messages = data.payload.thread_list;
					if (messages) {
						var ol = ids.length;

						for (var i in messages) {
							ids.i = messages.i;
							ids.length += 1;
						}

						console.log(ol + " ... " + ids.length);

						var new_count = ids.length - ol;
						if (new_count > 0) {
							_nextPage(start + new_count);
						}
						else {
							idsHandler(ids);
						}
					}
				})
				.setErrorHandler(errorHandler)
				.send();
		};

		_nextPage(0);
		console.log("came back");
	};

	GetInboxThreadIDs(function(threadIds) {
		console.log("Got " + threadIds.length + " IDs in total.");
	}, function(error) {
		console.log("Failed to get all those delicious threads: " + error);
	});
})(jQuery.noConflict());
