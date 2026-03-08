'''
Admin panal of the code 
'''
JAZZMIN_SETTINGS = {
    "site_title": "Job Sarathi Admin",
    "site_header": "Job Sarathi",
    "site_brand": "Job Sarathi",

    "welcome_sign": "Welcome to Job Sarathi Admin",

    "site_logo": None,
    "login_logo": None,
    "login_logo_dark": None,
    "site_icon": None,

    "search_model": [
        "auth.User",
        "company.Job"
    ],

    "topmenu_links": [
        {"name": "Dashboard", "url": "admin:index"},
        {"name": "View site", "url": "/", "new_window": True},
    ],

    "show_sidebar": True,
    "navigation_expanded": True,

    "order_with_respect_to": [
        "auth",
        "AdminPanal",
        "company",
        "user",
    ],

    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.group": "fas fa-users",

        "AdminPanal": "fas fa-cog",

        "company": "fas fa-building",
        "company.Job": "fas fa-briefcase",

        "user": "fas fa-user-tie",
        "user.CandidateProfile": "fas fa-id-badge",
        "user.JobApplication": "fas fa-file-signature",
        "user.Resume": "fas fa-file-alt",
        "user.Education": "fas fa-graduation-cap",
        "user.Experience": "fas fa-briefcase",
        "user.Skill": "fas fa-star",
    },

    "default_icon_parents": "fas fa-chevron-right",
    "default_icon_children": "fas fa-circle",

    "related_modal_active": True,

    "changeform_format": "horizontal_tabs",

    "custom_css": "css/admin-custom.css",
}


# ---------------------[JAZZMIN UI TWEAKS]-------------------- #
JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": True,

    "body_small_text": False,
    "brand_small_text": False,

    "brand_colour": "navbar-primary",
    "accent": "accent-primary",

    "navbar": "navbar-white navbar-light",

    "no_navbar_border": False,
    "navbar_fixed": True,

    "layout_boxed": False,

    "footer_fixed": False,

    "sidebar_fixed": True,

    "sidebar": "sidebar-dark-primary",

    "sidebar_nav_small_text": False,

    "sidebar_disable_expand": False,

    "sidebar_nav_child_indent": True,

    "sidebar_nav_compact_style": False,

    "sidebar_nav_legacy_style": False,

    "sidebar_nav_flat_style": False,

    "theme": "default",
    "dark_mode_theme": None,

    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success",
    },

    "actions_sticky_top": True,
}
