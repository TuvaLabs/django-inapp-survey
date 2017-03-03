from django.contrib import admin

from .models import CampaignCustomParam, Campaign, CampaignQuestion, \
    UserCampaign, UserCampaignResponse


class CampaignAdmin(admin.ModelAdmin):

    model = Campaign
    prepopulated_fields = { "slug": ["title"] }

admin.site.register(Campaign, CampaignAdmin)
admin.site.register(CampaignQuestion)
admin.site.register(CampaignCustomParam)
admin.site.register(UserCampaign)
admin.site.register(UserCampaignResponse)


