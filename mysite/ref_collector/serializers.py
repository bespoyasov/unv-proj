from rest_framework import serializers
from ref_collector.models import Page

class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = ('title', 'url', 'ref')
