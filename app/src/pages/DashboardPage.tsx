import { DailyObjectiveCard } from '@/components/features/daily-objectives/DailyObjectiveCard'
import { WeeklyChallengeCard } from '@/components/features/weekly-challenge/WeeklyChallengeCard'
import { MomentumCard } from '@/components/features/momentum/MomentumCard'
import { DeadlinesCard } from '@/components/features/deadlines/DeadlinesCard'
import { FocusCard } from '@/components/features/focus/FocusCard'
import { StudyChartCard } from '@/components/features/study/StudyChartCard'
import { RetentionBanner } from '@/components/features/retention/RetentionBanner'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Retention messaging */}
      <RetentionBanner />

      {/* Daily Objectives - Top Priority */}
      <DailyObjectiveCard />

      {/* Weekly Challenge */}
      <WeeklyChallengeCard />

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
