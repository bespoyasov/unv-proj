from django.conf.urls import url, include
from django.views.generic import ListView, DetailView
from docs.models import Doc

# pk — is for primary key
urlpatterns = [
    url(r'^$', ListView.as_view(queryset=Doc.objects.all().order_by('-date')[:25], template_name='docs/docs.html')),
    url(r'^(?P<pk>\d+)$', DetailView.as_view(model=Doc, template_name='docs/post.html'))
]
