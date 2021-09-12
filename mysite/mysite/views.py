from django.shortcuts import render
from django.http import HttpResponse
from django.template import RequestContext
import json

# Create your views here.
def index(request):
    survey_params = {
        'user_type': 'teacher',
        'is_authenticated': True,
        }
    context = {
        'survey_params': json.dumps(survey_params)
    }
    return render(
            request,
            'local/index.html',
            context)
