from django.conf.urls import url, include

from . import views
from inapp_survey.resources import ActiveCampaignList, ActiveCampaignDetails, \
    UserCampaignList, UserCampaignDetail

urlpatterns = [
    # TODO: only return the relevent
    url(r'^api/campaigns/$',
        ActiveCampaignList.as_view(),
        name='active-campaign-list'),
    url(r'^api/campaigns/(?P<slug>[0-9a-zA-Z_-]+)$',
        ActiveCampaignDetails.as_view(),
        name='active-campaign-details'),
    url(r'^api/response/$',
        UserCampaignList.as_view(
            ), name='campaign-enroll-list'),
    url(r'^api/response/(?P<pk>\d+)/$',
        UserCampaignDetail.as_view(
            ), name='campaign-enroll-details'),

    url(r'^api-auth/', include('rest_framework.urls',
                               namespace='rest_framework')),
    # service for creating usercampaign
    # save the responses
]
