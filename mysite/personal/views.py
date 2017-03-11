from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from personal.models import Page
from mysite.serializers import PageSerializer

def index(request):
    return render(request, 'personal/home.html')

def contact(request):
    return render(request, 'personal/basic.html', {'content': ['Например, почта', 'email@me.com'] })

def about(request):
    return render(request, 'personal/about.html')

@api_view(['GET'])
def page_collection(request):
    if request.method == 'GET':
        pages = Page.objects.all()
        serializer = PageSerializer(pages, many=True)
        return Response(serializer.data)
