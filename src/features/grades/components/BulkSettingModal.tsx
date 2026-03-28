import { useState } from 'react'
import type { Student, SubjectCode } from '@/types'
import { SUBJECT_LABEL } from '@/types'
import { PRESET_SUBJECTS } from '../constants'

interface BulkSettingModalProps {
  target: 'class' | 'selected'
  classLabel: string
  selectedStudents: Student[]
  onConfirm: (subjects: SubjectCode[]) => void
  onClose: () => void
}

export function BulkSettingModal({
  target,
  classLabel,
  selectedStudents,
  onConfirm,
  onClose,
}: BulkSettingModalProps) {
  const [checkedSubjects, setCheckedSubjects] = useState<Set<SubjectCode>>(
    new Set(['KOREAN', 'MATH', 'ENGLISH', 'SCIENCE', 'SOCIAL', 'HISTORY'] as SubjectCode[]),
  )

  const toggleSubject = (subject: SubjectCode) => {
    setCheckedSubjects((prev) => {
      const next = new Set(prev)
      if (next.has(subject)) next.delete(subject)
      else next.add(subject)
      return next
    })
  }
  
  const targetLabel =
    target === 'class' ? `${classLabel} 전체` : `선택 학생 ${selectedStudents.length}명`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-surface-container flex items-center justify-between">
          <div>
            <h2 className="font-headline text-base font-semibold text-on-surface">과목 일괄 설정</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {targetLabel}에 과목을 추가합니다. (점수는 나중에 입력)
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="px-6 py-4">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
            과목 선택 ({checkedSubjects.size}개)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_SUBJECTS.map((code) => (
              <label
                key={code}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  checkedSubjects.has(code)
                    ? 'bg-primary/10 text-primary'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checkedSubjects.has(code)}
                  onChange={() => toggleSubject(code)}
                  className="w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary/20"
                />
                <span className="text-sm font-medium">{SUBJECT_LABEL[code]}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-surface-container flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => onConfirm([...checkedSubjects])}
            disabled={checkedSubjects.size === 0}
            className="px-4 py-2 text-sm font-bold text-on-primary bg-primary hover:bg-primary-dim rounded-lg transition-colors disabled:opacity-40"
          >
            적용 ({checkedSubjects.size}개)
          </button>
        </div>
      </div>
    </div>
  )
}
