#-----------------------[IMPORTS MODELS]----------------------------#
from django.urls import path
from .views import WebsiteSettingsViews


#-------------[URLS CODE]-------------#
urlpatterns = [
    path('api/website-settings/', WebsiteSettingsViews.as_view(), name='website-settings'),
]