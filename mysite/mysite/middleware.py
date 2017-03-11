from django.conf import settings


class RefCollectorMiddleware(object):
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        referer_url = request.META.get("HTTP_REFERER", None)
        if referer_url != None and self._is_local_domain(referer_url):
            # to db
            pass

        response = self.get_response(request)
        return response

    def _is_local_domain(self, url):
        return url.find(settings.BASE_DOMAIN) > -1
