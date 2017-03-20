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
            'id',
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
                'id',
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
        exclude = ( 'user_campaign', )

        # To handle the unique entry per user_campaing and question
        # validators = [
        #     UniqueTogetherValidator(
        #         queryset=UserCampaignResponse.objects.all(),
        #         fields=('user_campaign', 'question')
        #     )
        # ]


class UserCampaignSerializer(serializers.ModelSerializer):

    answers = UserCampaignResponseSerializer(
            source='usercampaignresponse_set',
            many=True,
            required=False)

    # While doing default save, we run into the issue because
    # user_campaign is not available for the nested responses
    # serializer
    def create(self, validated_data):
        answer_data = validated_data.pop('usercampaignresponse_set')
        usercampaign_post = UserCampaign.objects.create(**validated_data)

        for post in answer_data:
            e = UserCampaignResponse.objects.create(
                user_campaign=usercampaign_post, **post)

        return usercampaign_post


    class Meta:
        model = UserCampaign
        fields = (
            'id',
            'user',
            'campaign',
            'is_completed',
            'is_canceled',
            'answers',
        )

        validators = [
            UniqueTogetherValidator(
                queryset=UserCampaign.objects.all(),
                fields=('user', 'campaign')
            )
        ]

