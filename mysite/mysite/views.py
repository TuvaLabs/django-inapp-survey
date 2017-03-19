from django.shortcuts import render_to_response, render
from django.http import HttpResponse
from django.template import RequestContext
import json

# Create your views here.
def index(request):
    survey_params = {
        'user_type': 'teacher',
        'is_authenticated': True,
        }
    context = RequestContext(
        request, {
            'survey_params': json.dumps(survey_params)
        })
    return render_to_response(
            'local/index.html',
            context_instance=context)
