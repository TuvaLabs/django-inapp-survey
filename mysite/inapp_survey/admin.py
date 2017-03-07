from django.contrib import admin
from django import forms
from .models import CampaignCustomParam, Campaign, CampaignQuestion, \
    UserCampaign, UserCampaignResponse


# Widget to set markdown editor
class MarkdownDelightEditorWidget(forms.TextInput):

    def render(self, name, value, attrs=None):
        if value:
            tpl = Template(
                u"""<markdown-delight-editor-extended name="$name">$value</markdown-delight-editor-extended>""")
            return mark_safe(tpl.substitute(name=name, value=value))
        else:
            tpl = Template(
                u"""<markdown-delight-editor-extended name="$name"></markdown-delight-editor-extended>""")
            return mark_safe(tpl.substitute(name=name))


class CampaignQuestionForm(forms.ModelForm):

    class Meta:
        model = CampaignQuestion
        fields = '__all__'
        # widgets = {
        #     'question': MarkdownDelightEditorWidget(),
        # }


class CampaignQuestionInline(admin.TabularInline):
    model = CampaignQuestion
    form = CampaignQuestionForm
    extra = 0
    ordering = ("order", )
    fields = ("order", "question", )


class CampaignAdmin(admin.ModelAdmin):

    model = Campaign
    list_display = (
        "__unicode__",
        "created",
        "campaign_type",
        "expiry_date",
    )
    inlines = [CampaignQuestionInline]
    prepopulated_fields = { "slug": ["title"] }


admin.site.register(Campaign, CampaignAdmin)
admin.site.register(CampaignQuestion)
admin.site.register(CampaignCustomParam)
admin.site.register(UserCampaign)
admin.site.register(UserCampaignResponse)

