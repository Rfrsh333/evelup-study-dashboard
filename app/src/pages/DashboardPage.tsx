import { MomentumCard } from '@/components/features/momentum/MomentumCard'
import { DeadlinesCard } from '@/components/features/deadlines/DeadlinesCard'
import { FocusCard } from '@/components/features/focus/FocusCard'
import { StudyChartCard } from '@/components/features/study/StudyChartCard'

export function DashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <MomentumCard />
      <DeadlinesCard />
      <FocusCard />
      <StudyChartCard />
    </div>
  )
}
