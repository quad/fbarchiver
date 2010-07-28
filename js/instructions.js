$(function() {
    $('#instructions').append(function() {
        var b = '<a class="bookmarklet" title="Archive your Facebook" href="javascript:(function(){var%20script=document.createElement(\'script\');script.id=\'fbarchiver-inbox\';script.src=\'http://' + document.location.host + '/inbox.js\';document.getElementsByTagName(\'head\')[0].appendChild(script);})()">Archive your Facebook</a>';
        return $.browser.msie ? 'Right-click ' + b + ' and pick <code>Add to Favorites</code>' : 'Drag ' + b + ' to your web browser bookmarks bar.';
    });
});
