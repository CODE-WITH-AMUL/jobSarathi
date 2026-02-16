from django.urls import path
from .views import test_api

urlpatterns = [
    path('v1/test/', test_api, name='test_api'),
]