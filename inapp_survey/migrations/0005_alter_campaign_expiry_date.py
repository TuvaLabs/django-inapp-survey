# Generated by Django 3.2 on 2024-05-15 07:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inapp_survey', '0004_alter_campaign_priority'),
    ]

    operations = [
        migrations.AlterField(
            model_name='campaign',
            name='expiry_date',
            field=models.DateField(null=True, verbose_name='Expiry'),
        ),
    ]