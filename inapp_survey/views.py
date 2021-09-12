from django.shortcuts import render
from django.http import HttpResponse
from django.template import RequestContext

# Create your views here.
def index(request):

    return render(
            request,
            'inapp_survey/index.html',
            context={})
    # return HttpResponse("Hello, world. You're at the in app index.")
