import { DailyObjectiveCard } from '@/components/features/daily-objectives/DailyObjectiveCard'
import { MomentumCard } from '@/components/features/momentum/MomentumCard'
import { DeadlinesCard } from '@/components/features/deadlines/DeadlinesCard'
import { FocusCard } from '@/components/features/focus/FocusCard'
import { StudyChartCard } from '@/components/features/study/StudyChartCard'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Daily Objectives - Top Priority */}
      <DailyObjectiveCard />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MomentumCard />
        <DeadlinesCard />
        <FocusCard />
        <StudyChartCard />
      </div>
    </div>
  )
}
