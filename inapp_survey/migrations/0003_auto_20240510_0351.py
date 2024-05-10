# Generated by Django 3.2 on 2024-05-10 03:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inapp_survey', '0002_auto_20210912_1311'),
    ]

    operations = [
        migrations.AddField(
            model_name='campaign',
            name='priority',
            field=models.CharField(choices=[('normal', 'Normal'), ('high', 'High')], default='normal', max_length=10, verbose_name='Priority'),
        ),
        migrations.AlterField(
            model_name='campaign',
            name='campaign_type',
            field=models.CharField(choices=[('announcement', 'Announcement'), ('survey', 'Survey')], default='announcement', max_length=500, verbose_name='Campaign Type'),
        ),
    ]
