# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-25 10:21
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Page',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(default='', max_length=200)),
                ('url', models.CharField(max_length=500)),
                ('ref', models.TextField(blank=True)),
            ],
        ),
    ]
