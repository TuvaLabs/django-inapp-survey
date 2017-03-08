from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator

from inapp_survey.models import Campaign, CampaignCustomParam, \
    CampaignQuestion


class CampaignCustomParamSerializer(serializers.ModelSerializer):

    class Meta:
        model = CampaignCustomParam
        fields = (
            "param_key",
            "param_value",
        )


class CampaignListSerializer(serializers.ModelSerializer):

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


class CampaignQuestionSerializer(serializers.ModelSerializer):

        class Meta:
            model = CampaignQuestion
            fields = (
                "id",
                "question",
                "order",
            )


class CampaignSerializer(serializers.ModelSerializer):

        custom_param = CampaignCustomParamSerializer(
            many=True, read_only=True)

        steps = CampaignQuestionSerializer(
            source='questions',
            many=True)

        class Meta:
            model = Campaign
            fields = (
                'title',
                'slug',
                'description',
                'is_authenticated',
                'expiry_date',
                'campaign_type',
                'steps',
                'custom_param'
            )

