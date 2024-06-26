from __future__ import unicode_literals

from django.db import models
from django_extensions.db.models import TimeStampedModel
from django.contrib.auth.models import User


CAMPAIGN_TYPE = (
    ('announcement', 'Announcement'),
    ('survey', 'Survey'),
)

CAMPAIGN_PRIORITY = (
    ('normal', 'Normal'),
    ('high', 'High'),
)


class CampaignCustomParam(TimeStampedModel):
    # example
    # audience: teacher, student
    # premium_only: true
    # page: Dataset, Course

    param_key  = models.CharField(
        null=False,
        blank=False,
        max_length=200)
    param_value  = models.CharField(
        null=False,
        blank=False,
        max_length=1000)

    def __str__(self):
        return '%s : %s' % (
            self.param_key,
            self.param_value)


class Campaign(TimeStampedModel):

    title = models.CharField(
        "Campaign Title",
        max_length=400,
        null=False,
        blank=False)
    slug = models.SlugField(
        max_length=100,
        null=True,
        blank=True
    )
    description = models.TextField(
        "Introduction Text",
        max_length=4000,
        null=True,
        blank=True
    )
    is_authenticated = models.BooleanField(default=True)
    expiry_date = models.DateField(
        "Expiry",
        blank=False,
        null=True)
    campaign_type = models.CharField(
        "Campaign Type",
        choices=CAMPAIGN_TYPE,
        max_length=500,
        default="announcement")
    priority = models.CharField(
        "Priority",
        choices=CAMPAIGN_PRIORITY,
        max_length=10,
        default="normal",
        help_text="Note: Normal Priority will show the campaign after 5 minutes. High priority will show the campaign immediately.")
    custom_param = models.ManyToManyField(
        CampaignCustomParam,
        related_name="params",
        blank=True)


    def completed_count(self):
        return self.usercampaign_set.filter(
            is_completed=True).count()

    def canceled_count(self):
        return self.usercampaign_set.filter(
            is_canceled=True).count()

    def __str__(self):
        return '%s' % (self.title)


class CampaignQuestion(TimeStampedModel):

    campaign = models.ForeignKey(
        Campaign,
        related_name="questions", on_delete=models.CASCADE)
    question = models.TextField(
        "question content",
        blank = False,
        null = False)
    order = models.PositiveIntegerField(
        "order",
        default=1)

    class Meta:
        ordering = ("order",)

    def __str__(self):
        return '%s-%s' % (
            self.campaign,
            self.order)


class UserCampaign(TimeStampedModel):

    user = models.ForeignKey(
        User, on_delete=models.CASCADE)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE)
    is_completed = models.BooleanField(default=False)
    is_canceled = models.BooleanField(default=False)

    def __str__(self):
        return '%s-%s' % (
            self.campaign,
            self.user)


class UserCampaignResponse(TimeStampedModel):

    user_campaign = models.ForeignKey(UserCampaign, on_delete=models.CASCADE)
    question = models.ForeignKey(CampaignQuestion, on_delete=models.CASCADE)
    response = models.TextField(
        null=True,
        blank=True)

    def __str__(self):
        return '%s-%s' % (
            self.user_campaign,
            self.question)


