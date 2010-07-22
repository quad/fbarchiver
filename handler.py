import glob
import os
import os.path
import urlparse

from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app


class Index(webapp.RequestHandler):
    def is_ie(self):
        """Detect MSIE."""

        return 'MSIE' in os.environ['HTTP_USER_AGENT']

    def get(self):
        template_values = {}

        # figure out the host name of this server (for serving the proper
        # javascript bookmarklet)
        parts = urlparse.urlparse(self.request.url)
        if parts.port:
            template_values['bookmarklet_host'] = parts.hostname + ':' + str(parts.port)
        else:
            template_values['bookmarklet_host'] = parts.hostname

        # we need to serve a different bookmarklet Javascript for MSIE
        if self.is_ie():
            template_values['instructions'] = "Right-click this link and 'Add to Favorites'"
        else:
            template_values['instructions'] = "Drag this link to your web browser bookmarks bar"

        path = os.path.join(os.path.dirname(__file__), 'index.html')
        self.response.out.write(template.render(path, template_values))


class JS(webapp.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/javascript'

        for fn in sorted(glob.glob(os.path.join(os.path.dirname(__file__), 'js', '*.js'))):
            self.response.out.write(file(fn).read())

if __name__ == '__main__':
    application = webapp.WSGIApplication(
        [
            ('/', Index),
            ('/mybook.js', JS),
        ], debug=True)
    run_wsgi_app(application)
