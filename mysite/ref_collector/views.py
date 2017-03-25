from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ref_collector.models import Page
from ref_collector.serializers import PageSerializer


@api_view(['GET'])
def page_collection(request):
    if request.method == 'GET':
        pages = Page.objects.all()
        serializer = PageSerializer(pages, many=True)
        return Response(serializer.data)
