from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator

from inapp_survey.models import Campaign


class CampaignSerializer(serializers.ModelSerializer):

    class Meta:
        model = Campaign
        fields = (
            'title',
            'slug',
            'description',
            'is_authenticated',
            'expiry_date',
            'campaign_type',
        )
