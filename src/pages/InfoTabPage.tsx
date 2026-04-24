import { useStudentInfo } from '@/features/students'

const FIELD_LABELS: Array<{ key: 'name' | 'birthDate' | 'phone' | 'parentPhone' | 'address'; label: string; readOnly?: boolean }> = [
  { key: 'name', label: '이름' },
  { key: 'birthDate', label: '생년월일' },
  { key: 'phone', label: '연락처' },
  { key: 'parentPhone', label: '학부모 연락처' },
  { key: 'address', label: '주소' },
]

export function InfoTabPage() {
  const { student, isLoading, mode, form, isSaving, handleEdit, handleCancel, handleSave, handleChange } = useStudentInfo()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="text-on-surface-variant text-sm">불러오는 중...</span>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="text-on-surface-variant text-sm">학생 정보를 찾을 수 없습니다.</span>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container">
        {/* 헤더 */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-surface-container">
          <h3 className="font-headline text-base font-semibold text-on-surface">기본 정보</h3>
          {mode === 'read' ? (
            <button
              type="button"
              onClick={handleEdit}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              수정하기
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-2 text-sm text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !form.name.trim()}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-on-primary bg-primary hover:bg-primary-dim rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[16px]">save</span>
                )}
                저장
              </button>
            </div>
          )}
        </div>

        {/* 읽기 전용 필드: 학년·반·번호 */}
        <div className="px-6 py-4 grid grid-cols-2 gap-x-8 gap-y-4 border-b border-surface-container">
          <div>
            <p className="text-xs text-on-surface-variant mb-1">학년</p>
            <p className="text-sm text-on-surface">{student.grade}학년</p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant mb-1">반</p>
            <p className="text-sm text-on-surface">{student.classNum}반</p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant mb-1">번호</p>
            <p className="text-sm text-on-surface">{student.number}번</p>
          </div>
        </div>

        {/* 수정 가능 필드 */}
        <div className="px-6 py-4 grid grid-cols-2 gap-x-8 gap-y-4">
          {FIELD_LABELS.map(({ key, label }) => (
            <div key={key} className={key === 'address' ? 'col-span-2' : ''}>
              <p className="text-xs text-on-surface-variant mb-1">{label}</p>
              {mode === 'read' ? (
                <p className="text-sm text-on-surface">{student[key] ?? '—'}</p>
              ) : (
                <input
                  type="text"
                  value={form[key] ?? ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-surface-container border border-outline-variant rounded-lg focus:outline-none focus:border-primary transition-colors"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
