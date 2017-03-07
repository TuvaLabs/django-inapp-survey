from django.conf.urls import url, include

from . import views
from inapp_survey.resources import ActiveCampaignList

urlpatterns = [
    url(r'^/api/campaigns$',
        ActiveCampaignList.as_view(),
        name='active-campaign-list'),
    url(r'^api-auth/', include('rest_framework.urls',
                               namespace='rest_framework')),
    url(r'^$', views.index, name="index"),
]
