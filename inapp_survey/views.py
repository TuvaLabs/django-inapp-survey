from django.shortcuts import render_to_response, render
from django.http import HttpResponse
from django.template import RequestContext

# Create your views here.
def index(request):

    return render_to_response(
            'inapp_survey/index.html',
            context_instance=RequestContext(request))
    # return HttpResponse("Hello, world. You're at the in app index.")
