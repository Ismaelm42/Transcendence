from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
# serve a jinja file (index.html from templates)
def index(request):
	return render(request, 'index.html')

def hello(request):
	return HttpResponse("<h1>Hello<h1>")

def about(request):
	return HttpResponse("<h1>About<h1>")
