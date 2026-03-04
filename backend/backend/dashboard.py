from django.db.models import Count
from django.utils.translation import gettext_lazy as _

from jet.dashboard import modules
from jet.dashboard.dashboard import Dashboard

from user.models import CandidateProfile, JobApplication
from company.models import Job


class JobPortalOverviewModule(modules.DashboardModule):
    """
    Main dashboard widget with KPIs and charts.
    """
    title = _("Job Portal Overview")
    template = "dashboard/job_portal_dashboard.html"
    column = 0
    order = 0

    def init_with_context(self, context):
        # Core KPI counts
        self.total_candidates = CandidateProfile.objects.count()
        self.total_jobs = Job.objects.count()
        self.total_applications = JobApplication.objects.count()

        # Top jobs by number of applications (for bar chart)
        applications_per_job = (
            JobApplication.objects
            .values("job__job_title")
            .annotate(total=Count("id"))
            .order_by("-total")[:8]
        )

        # Active jobs by job_status (for pie/doughnut chart)
        jobs_by_status = (
            Job.objects
            .values("job_status")
            .annotate(total=Count("id"))
            .order_by("-total")
        )

        # Expose to template
        self.applications_per_job = list(applications_per_job)
        self.jobs_by_status = list(jobs_by_status)


class CustomIndexDashboard(Dashboard):
    """
    Custom index dashboard used by Django JET.
    """
    columns = 3

    def init_with_context(self, context):
        # Main stats + charts module
        self.children.append(JobPortalOverviewModule())

        # Quick access to important models
        self.children.append(modules.AppList(
            _("Job Management"),
            models=(
                "company.models.Job",
                "user.models.CandidateProfile",
                "user.models.JobApplication",
                "user.models.Resume",
                "user.models.Education",
                "user.models.Experience",
                "user.models.Skill",
            ),
            column=1,
            order=1,
        ))

        # Recent admin activity
        self.children.append(modules.RecentActions(
            _("Recent Admin Actions"),
            10,
            column=2,
            order=2,
        ))

