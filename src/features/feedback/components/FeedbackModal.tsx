import type { FeedbackCategory, FeedbackRequest } from '@/types'

const CATEGORIES: Array<{ value: FeedbackCategory; label: string }> = [
  { value: 'GRADE', label: '성적' },
  { value: 'BEHAVIOR', label: '행동' },
  { value: 'ATTITUDE', label: '태도' },
  { value: 'ATTENDANCE', label: '출결' },
  { value: 'OTHER', label: '기타' },
]

interface FeedbackModalProps {
  mode: 'adding' | 'editing'
  form: FeedbackRequest
  isMutating: boolean
  onFormChange: (field: keyof FeedbackRequest, value: string | boolean) => void
  onSave: () => void
  onClose: () => void
}

export function FeedbackModal({
  mode,
  form,
  isMutating,
  onFormChange,
  onSave,
  onClose,
}: FeedbackModalProps) {
  const isDisabled = isMutating || !form.date || !form.content.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md mx-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-surface-container">
          <h2 className="font-headline text-base font-semibold text-on-surface">
            {mode === 'adding' ? '피드백 작성' : '피드백 수정'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 폼 */}
        <div className="px-6 py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface-variant">카테고리</label>
            <select
              value={form.category}
              onChange={(e) => onFormChange('category', e.target.value)}
              className="px-3 py-2 text-sm bg-surface-container border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
            >
              {CATEGORIES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface-variant">날짜</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => onFormChange('date', e.target.value)}
              className="px-3 py-2 text-sm bg-surface-container border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface-variant">내용</label>
            <textarea
              value={form.content}
              onChange={(e) => onFormChange('content', e.target.value)}
              rows={5}
              placeholder="피드백 내용을 입력하세요"
              className="px-3 py-2 text-sm bg-surface-container border border-outline-variant rounded-lg focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-on-surface-variant">공개 설정</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.studentVisible}
                onChange={(e) => onFormChange('studentVisible', e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm text-on-surface">학생에게 공개</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.parentVisible}
                onChange={(e) => onFormChange('parentVisible', e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm text-on-surface">학부모에게 공개</span>
            </label>
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-surface-container">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isDisabled}
            className="px-4 py-2 text-sm text-on-primary bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
