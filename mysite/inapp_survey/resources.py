from rest_framework import generics, mixins, permissions, \
    views, parsers, response, status
from rest_framework.response import Response

from inapp_survey.models import Campaign
from inapp_survey.serializers import CampaignSerializer

class ActiveCampaignList(generics.ListAPIView):

    model = Campaign
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer
    permission_classes = [
        permissions.AllowAny
    ]
