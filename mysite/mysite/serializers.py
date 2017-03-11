from rest_framework import serializers
from personal.models import Page

class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = ('title', 'url', 'ref')
