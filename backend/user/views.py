from django.shortcuts import render
from django.views.generic import TemplateView


class test(TemplateView):
    template_name = ".html"
