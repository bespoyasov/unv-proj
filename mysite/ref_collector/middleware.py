from django.conf import settings
from django.http import HttpRequest
from ref_collector.models import Page


class RefCollectorMiddleware(object):
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        referer_url = request.META.get("HTTP_REFERER", None)
        request_url = HttpRequest.get_full_path(request)

        if referer_url != None and self._is_local_domain(referer_url):
            pages = Page.objects.all()
            for page in pages:
                if request_url == page.url:
                    prefix = '/' if len(page.ref) == 0 else ',/'
                    page.ref += (prefix + referer_url.replace(settings.BASE_DOMAIN, ''))
                    page.save()

        response = self.get_response(request)
        return response

    def _is_local_domain(self, url):
        return url.find(settings.BASE_DOMAIN) > -1