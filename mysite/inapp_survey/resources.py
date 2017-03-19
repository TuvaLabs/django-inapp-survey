from rest_framework import generics, mixins, permissions, \
    views, parsers, response, status
from rest_framework.response import Response
from datetime import datetime

from inapp_survey.models import Campaign, UserCampaign, \
    UserCampaignResponse
from inapp_survey.serializers import CampaignSerializer, \
    CampaignListSerializer, UserCampaignSerializer

# TODO: Return the active campaign based on the information is passed in querystring
# param - will need to return based on that the first one.
class ActiveCampaignList(views.APIView):

    # query string param match
    # Only return the first one.
    permission_classes = [
        permissions.AllowAny
    ]

    def post(self, request, *args, **kwargs):

        # If its expired, don't return
        campaign = Campaign.objects.filter(expiry_date__gt=datetime.now()).order_by('expiry_date')

        # check for is_authenticated
        if request.user.is_authenticated():

            exclude_responded = []
            for item in campaign:
                if item.usercampaign_set.filter(
                    user=request.user,
                    is_completed=True).exists():
                    exclude_responded.append(item.id)

            # exclude the one which is already completed by user
            campaign = campaign.exclude(id__in=exclude_responded)
        else:
            campaign = campaign.filter(is_authenticated=False)
            # If user is unauthenticated, also exclude the completed/canceled
            # campaigns passed by front end.
            if request.data.has_key('completed_campaigns'):
                campaign = campaign.exclude(
                    id__in=request.data['completed_campaigns'])

        # check for custom_param filtering
        user_param = {}
        if request.data.has_key('custom_params'):
            user_param = request.data['custom_params']
        filter_based_on_param = []
        for item in campaign:
            for param in item.custom_param.all():
                if user_param.has_key(param.param_key) and user_param[param.param_key] in param.param_value:
                    pass
                else:
                    filter_based_on_param.append(item.id)
                    break

        campaign = campaign.exclude(id__in=filter_based_on_param)


        serializers = CampaignSerializer(campaign.first())
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


class UserCampaignDetail(generics.RetrieveUpdateDestroyAPIView):
    '''
    Retrieve, update or delete a board instance
    '''

    model = UserCampaign
    serializer_class = UserCampaignSerializer
    queryset = UserCampaign.objects.all()
    lookup_field = 'pk'
    permission_classes = (
        permissions.IsAuthenticatedOrReadOnly,
    )


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


# resource to make user campaign answers
UserCampaign, Response

