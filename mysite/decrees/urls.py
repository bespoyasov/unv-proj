from django.conf.urls import url, include
from django.views.generic import ListView, DetailView
from decrees.models import Decree

# pk — is for primary key
urlpatterns = [
    url(r'^$', ListView.as_view(queryset=Decree.objects.all().order_by('-date')[:25], template_name='decrees/decrees.html')),
    url(r'^(?P<pk>\d+)$', DetailView.as_view(model=Decree, template_name='decrees/post.html'))
]
