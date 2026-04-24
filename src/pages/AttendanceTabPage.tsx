import { useAttendancePage } from '@/features/attendance'
import type { AttendanceRequest } from '@/types'

const STATUS_LABEL: Record<string, string> = {
  PRESENT: '출석',
  ABSENT: '결석',
  LATE: '지각',
  EARLY_LEAVE: '조퇴',
  SICK: '병결',
}

const STATUS_COLOR: Record<string, string> = {
  PRESENT: 'text-green-600',
  ABSENT: 'text-red-500',
  LATE: 'text-orange-500',
  EARLY_LEAVE: 'text-yellow-600',
  SICK: 'text-blue-500',
}

const EDITABLE_STATUSES: AttendanceRequest['status'][] = ['ABSENT', 'LATE', 'EARLY_LEAVE', 'SICK']

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

export function AttendanceTabPage() {
  const {
    records,
    isLoading,
    year,
    month,
    summary,
    inlineMode,
    form,
    isMutating,
    setYear,
    setMonth,
    handleStartAdd,
    handleStartEdit,
    handleStartDelete,
    handleCancel,
    handleSave,
    handleConfirmDelete,
    handleFormChange,
  } = useAttendancePage()

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* 필터 + 추가 버튼 */}
      <div className="flex items-center gap-3 mb-4">
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="px-3 py-1.5 text-sm bg-surface-container border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}년</option>
          ))}
        </select>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="px-3 py-1.5 text-sm bg-surface-container border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
        >
          {MONTHS.map((m) => (
            <option key={m} value={m}>{m}월</option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleStartAdd}
          disabled={inlineMode.type !== 'idle'}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          출결 기록 추가
        </button>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: '결석', value: summary.absent, color: 'text-red-500' },
          { label: '지각', value: summary.late, color: 'text-orange-500' },
          { label: '조퇴', value: summary.earlyLeave, color: 'text-yellow-600' },
          { label: '병결', value: summary.sick, color: 'text-blue-500' },
        ].map((s) => (
          <div key={s.label} className="bg-surface-container-lowest rounded-xl border border-surface-container px-4 py-3 text-center">
            <p className="text-xs text-on-surface-variant mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* 테이블 */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-container">
              <th className="px-4 py-3 text-left text-xs text-on-surface-variant font-medium w-32">날짜</th>
              <th className="px-4 py-3 text-left text-xs text-on-surface-variant font-medium w-24">상태</th>
              <th className="px-4 py-3 text-left text-xs text-on-surface-variant font-medium">사유</th>
              <th className="px-4 py-3 w-24" />
            </tr>
          </thead>
          <tbody>
            {/* 추가 행 */}
            {inlineMode.type === 'adding' && (
              <InlineRow
                form={form}
                onFormChange={handleFormChange}
                onSave={handleSave}
                onCancel={handleCancel}
                isMutating={isMutating}
              />
            )}

            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-on-surface-variant">불러오는 중...</td>
              </tr>
            ) : records.length === 0 && inlineMode.type !== 'adding' ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-on-surface-variant">출결 기록이 없습니다.</td>
              </tr>
            ) : (
              records.map((record) => {
                if (inlineMode.type === 'editing' && inlineMode.id === record.id) {
                  return (
                    <InlineRow
                      key={record.id}
                      form={form}
                      onFormChange={handleFormChange}
                      onSave={handleSave}
                      onCancel={handleCancel}
                      isMutating={isMutating}
                    />
                  )
                }

                if (inlineMode.type === 'deleting' && inlineMode.id === record.id) {
                  return (
                    <tr key={record.id} className="border-b border-surface-container bg-error/5">
                      <td colSpan={3} className="px-4 py-3 text-sm text-on-surface">
                        <span className="font-medium">{record.date}</span> 출결 기록을 삭제할까요?
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="px-2 py-1 text-xs text-on-surface-variant border border-outline-variant rounded hover:bg-surface-container transition-colors"
                          >
                            취소
                          </button>
                          <button
                            type="button"
                            onClick={handleConfirmDelete}
                            disabled={isMutating}
                            className="px-2 py-1 text-xs text-on-error bg-error rounded hover:bg-error/80 transition-colors disabled:opacity-50"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                }

                return (
                  <tr key={record.id} className="border-b border-surface-container last:border-0 hover:bg-surface-container/50">
                    <td className="px-4 py-3 text-on-surface">{record.date}</td>
                    <td className={`px-4 py-3 font-medium ${STATUS_COLOR[record.status] ?? ''}`}>
                      {STATUS_LABEL[record.status] ?? record.status}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{record.reason ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(record.id)}
                          disabled={inlineMode.type !== 'idle'}
                          className="p-1 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-40"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartDelete(record.id)}
                          disabled={inlineMode.type !== 'idle'}
                          className="p-1 text-on-surface-variant hover:text-error transition-colors disabled:opacity-40"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface InlineRowProps {
  form: AttendanceRequest
  onFormChange: (field: keyof AttendanceRequest, value: string) => void
  onSave: () => void
  onCancel: () => void
  isMutating: boolean
}

function InlineRow({ form, onFormChange, onSave, onCancel, isMutating }: InlineRowProps) {
  return (
    <tr className="border-b border-surface-container bg-surface-container/30">
      <td className="px-4 py-2">
        <input
          type="date"
          value={form.date}
          onChange={(e) => onFormChange('date', e.target.value)}
          className="w-full px-2 py-1 text-sm bg-surface-container border border-outline-variant rounded focus:outline-none focus:border-primary"
        />
      </td>
      <td className="px-4 py-2">
        <select
          value={form.status}
          onChange={(e) => onFormChange('status', e.target.value)}
          className="w-full px-2 py-1 text-sm bg-surface-container border border-outline-variant rounded focus:outline-none focus:border-primary"
        >
          {EDITABLE_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-2">
        <input
          type="text"
          value={form.reason ?? ''}
          onChange={(e) => onFormChange('reason', e.target.value)}
          placeholder="사유 (선택)"
          className="w-full px-2 py-1 text-sm bg-surface-container border border-outline-variant rounded focus:outline-none focus:border-primary"
        />
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-1 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-2 py-1 text-xs text-on-surface-variant border border-outline-variant rounded hover:bg-surface-container transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isMutating || !form.date}
            className="px-2 py-1 text-xs text-on-primary bg-primary rounded hover:bg-primary-dim transition-colors disabled:opacity-50"
          >
            저장
          </button>
        </div>
      </td>
    </tr>
  )
}
