from django.urls import path, include
from django.urls.conf import re_path

from . import views
from inapp_survey.resources import ActiveCampaignList, ActiveCampaignDetails, \
    UserCampaignList, UserCampaignDetail

urlpatterns = [
    # TODO: only return the relevent
    path('api/campaigns/',
        ActiveCampaignList.as_view(),
        name='active-campaign-list'),
    re_path(r'^api/campaigns/(?P<slug>[0-9a-zA-Z_-]+)$',
        ActiveCampaignDetails.as_view(),
        name='active-campaign-details'),
    path('api/response/',
        UserCampaignList.as_view(
            ), name='campaign-enroll-list'),
    re_path(r'^api/response/(?P<pk>\d+)/$',
        UserCampaignDetail.as_view(
            ), name='campaign-enroll-details'),

    path('api-auth/', include('rest_framework.urls',
                               namespace='rest_framework')),
    # service for creating usercampaign
    # save the responses
]
