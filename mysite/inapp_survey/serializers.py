from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator

from .models import Campaign, CampaignCustomParam, \
    CampaignQuestion, UserCampaign, UserCampaignResponse


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


# User Campaign Responses
class UserCampaignResponseSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserCampaignResponse

        # To handle the unique entry per user_campaing and question
        validators = [
            UniqueTogetherValidator(
                queryset=UserCampaignResponse.objects.all(),
                fields=('user_campaign', 'question')
            )
        ]


class UserCampaignSerializer(serializers.ModelSerializer):

    answers = UserCampaignResponseSerializer(
            source='usercampaignresponse_set',
            many=True)

    class Meta:
        model = UserCampaign
        fields = (
            'id',
            'user',
            'campaign',
            'is_completed',
            'answers',
        )

        validators = [
            UniqueTogetherValidator(
                queryset=UserCampaign.objects.all(),
                fields=('user', 'campaign')
            )
        ]

