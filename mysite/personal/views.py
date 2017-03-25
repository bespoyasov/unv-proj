from django.shortcuts import render
from django.http import HttpResponse

def index(request):
    return render(request, 'personal/home.html')

def contact(request):
    return render(request, 'personal/basic.html', {'content': ['Например, почта', 'email@me.com'] })

def about(request):
    return render(request, 'personal/about.html')