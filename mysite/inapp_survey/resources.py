from rest_framework import generics, mixins, permissions, \
    views, parsers, response, status
from rest_framework.response import Response
from datetime import datetime

from inapp_survey.models import Campaign, UserCampaign
from inapp_survey.serializers import CampaignSerializer, \
    CampaignListSerializer, UserCampaignSerializer

# TODO: Return the active campaign based on the information is passed in querystring
# param - will need to return based on that the first one.
class ActiveCampaignList(views.APIView):

    # If its expired, don't return
    # query string param match
    # Only return the first one.
    permission_classes = [
        permissions.AllowAny
    ]

    def get(self, request, *args, **kwargs):

        campaign = Campaign.objects.filter(expiry_date__gt=datetime.now()).order_by('expiry_date').first()
        # restrictions - expiry date is already applied
        # is_authenticated
        #
        serializers = CampaignSerializer(campaign)
        return Response(serializers.data)


class UserCampaignList(generics.ListCreateAPIView):
    '''
    List of users enrolled campaign, or enroll for new campaign.
    '''

    model = UserCampaign
    serializer_class = UserCampaignSerializer
    queryset = UserCampaign.objects.all()
    permission_classes = (
        permissions.IsAuthenticatedOrReadOnly,)

    def pre_save(self, obj):

        obj.user = self.request.user


class ActiveCampaignDetails(generics.RetrieveAPIView):
    """Get the campaign details"""

    model = Campaign
    serializer_class = CampaignSerializer
    permission_classes = [
        permissions.AllowAny
    ]
    lookup_field = 'slug'
    queryset = Campaign.objects.all()

    # define the post call here


# if user is not enrolled and close the campaign, save the praference locally
# for that slug


# resource to make user campaign
# resource to make user campaign answers
