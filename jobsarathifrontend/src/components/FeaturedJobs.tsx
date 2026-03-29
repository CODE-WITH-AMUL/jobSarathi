import React from 'react'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, DollarSign, Bookmark } from "lucide-react"

interface Job {
  id: number
  title: string
  company: string
  location: string
  salary: string
  type: string
  experience: string
}

interface FeaturedJobsProps {
  jobs: Job[]
  onApply: (job: Job) => void
}

const FeaturedJobs: React.FC<FeaturedJobsProps> = ({ jobs, onApply }) => {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-24 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-3xl font-semibold">Featured Jobs</h2>
            <p className="text-sm text-muted-foreground">Find your next opportunity</p>
          </div>
        </div>
        <Button variant="ghost" className="hidden md:block">
          View all jobs →
        </Button>
      </div>

      {/* Jobs Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <Card
            key={job.id}
            onClick={() => onApply(job)}
            className="cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 rounded-2xl"
          >
            <CardHeader className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold leading-tight">
                    {job.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {job.company}
                  </p>
                </div>
                <Badge variant="secondary">{job.type}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {job.location}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                {job.salary}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                {job.experience}
              </div>
            </CardContent>

            <CardFooter className="flex gap-3">
              <Button
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation()
                  onApply(job)
                }}
              >
                Apply
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => e.stopPropagation()}
              >
                <Bookmark className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}

export default FeaturedJobs
