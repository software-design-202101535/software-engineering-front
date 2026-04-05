import type { NoteCategory, NoteRequest } from '@/types'

const CATEGORIES: NoteCategory[] = ['ACHIEVEMENT', 'SPECIAL', 'VOLUNTEER', 'CAREER', 'OTHER']

const CATEGORY_LABEL: Record<NoteCategory, string> = {
  ACHIEVEMENT: '성취',
  SPECIAL: '특기',
  VOLUNTEER: '봉사',
  CAREER: '진로',
  OTHER: '기타',
}

interface NoteModalProps {
  mode: 'adding' | 'editing'
  form: NoteRequest
  isMutating: boolean
  onFormChange: (field: keyof NoteRequest, value: string) => void
  onSave: () => void
  onClose: () => void
}

export function NoteModal({ mode, form, isMutating, onFormChange, onSave, onClose }: NoteModalProps) {
  const isValid = !!form.category && !!form.content.trim() && !!form.date

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md mx-4">
        {/* 헤더 */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-surface-container">
          <h2 className="font-headline text-base font-semibold text-on-surface">
            {mode === 'adding' ? '특기사항 추가' : '특기사항 수정'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* 폼 */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs text-on-surface-variant mb-1.5">카테고리</label>
            <select
              value={form.category}
              onChange={(e) => onFormChange('category', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface-container border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-on-surface-variant mb-1.5">날짜</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => onFormChange('date', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface-container border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs text-on-surface-variant mb-1.5">내용</label>
            <textarea
              value={form.content}
              onChange={(e) => onFormChange('content', e.target.value)}
              rows={5}
              placeholder="특기사항 내용을 입력하세요."
              className="w-full px-3 py-2 text-sm bg-surface-container border border-outline-variant rounded-lg focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 flex justify-end gap-2 border-t border-surface-container">
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
            disabled={isMutating || !isValid}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-on-primary bg-primary hover:bg-primary-dim rounded-lg transition-colors disabled:opacity-50"
          >
            {isMutating ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-[16px]">save</span>
            )}
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
