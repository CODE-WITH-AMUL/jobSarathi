from django.urls import path
from .views import test

urlpatterns = [
    path('tetsing', test.as_view() , name='test')
]