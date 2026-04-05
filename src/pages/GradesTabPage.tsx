import { useGradePage } from '@/features/grades'
import {
  SemesterSelector,
  GradeTable,
  RadarChart,
  ClassStudentPanel,
  BulkSettingModal,
} from '@/features/grades'
import type { StudentSummary } from '@/types'

export function GradesTabPage() {
  const {
    sid,
    student,
    grades,
    classStudents,
    avg,
    radarData,
    semester,
    examType,
    subTab,
    tableMode,
    isSelecting,
    selectedIds,
    editedScores,
    newSubject,
    newScore,
    bulkTarget,
    isApplyOpen,
    isSaving,
    setSubTab,
    setTableMode,
    setBulkTarget,
    setIsApplyOpen,
    setNewSubject,
    setNewScore,
    handleSemesterChange,
    handleExamTypeChange,
    handleEdit,
    handleSave,
    handleCancel,
    handleDelete,
    handleScoreChange,
    handleConfirmAdd,
    handleCancelAdd,
    handleBulkConfirm,
    handleToggleSelect,
    handleToggleSelecting,
  } = useGradePage()

  return (
    <div className="flex h-full min-h-0">
      {/* 좌측: 반 학생 목록 */}
      <ClassStudentPanel
        students={classStudents}
        currentStudentId={sid}
        isSelecting={isSelecting}
        selectedIds={selectedIds}
        onToggleSelecting={handleToggleSelecting}
        onToggleSelect={handleToggleSelect}
      />

      {/* 우측: 성적 영역 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 컨트롤 바 */}
        <div className="px-6 py-3 flex items-center gap-3 flex-wrap border-b border-surface-container bg-surface-container-lowest">
          <SemesterSelector
            semester={semester}
            examType={examType}
            onSemesterChange={handleSemesterChange}
            onExamTypeChange={handleExamTypeChange}
          />

          {/* 과목 일괄 적용 드롭다운 */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsApplyOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-on-surface-variant bg-surface-container-low border-0 border-b-2 border-primary-fixed-dim rounded-t-lg hover:border-primary transition-colors"
            >
              이 반에 과목 적용
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>
            {isApplyOpen && (
              <div className="absolute top-full left-0 mt-1 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container z-20 min-w-[160px] py-1">
                <button
                  type="button"
                  onClick={() => { setBulkTarget('class'); setIsApplyOpen(false) }}
                  className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors"
                >
                  반 전체에 적용
                </button>
                <button
                  type="button"
                  onClick={() => { setBulkTarget('selected'); setIsApplyOpen(false) }}
                  disabled={selectedIds.length === 0}
                  className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors disabled:opacity-40"
                >
                  선택 학생에 적용 {selectedIds.length > 0 && `(${selectedIds.length}명)`}
                </button>
              </div>
            )}
          </div>

          {/* 서브 탭 */}
          <div className="ml-auto flex items-center gap-1 bg-surface-container rounded-lg p-0.5">
            {(['list', 'chart'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSubTab(t)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  subTab === t
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t === 'list' ? '목록' : '시각화'}
              </button>
            ))}
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto">
          {subTab === 'list' ? (
            <div className="p-6">
              <div className="bg-surface-container-lowest rounded-xl border border-surface-container">
                {/* 카드 헤더 */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-surface-container">
                  <div className="flex items-center gap-4">
                    <h3 className="font-headline text-base font-semibold text-on-surface">성적 목록</h3>
                    {grades.length > 0 && (
                      <span className="text-sm text-on-surface-variant">
                        평균 <span className="font-semibold text-primary">{avg}점</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {tableMode === 'read' ? (
                      <button
                        type="button"
                        onClick={handleEdit}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        수정하기
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setTableMode('adding')}
                          disabled={tableMode === 'adding'}
                          className="flex items-center gap-1.5 px-3 py-2 text-sm text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container transition-colors disabled:opacity-40"
                        >
                          <span className="material-symbols-outlined text-[16px]">add</span>
                          과목 추가
                        </button>
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
                          disabled={isSaving}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-on-primary bg-primary hover:bg-primary-dim rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isSaving ? (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span className="material-symbols-outlined text-[16px]">save</span>
                          )}
                          저장
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <GradeTable
                  grades={grades}
                  mode={tableMode}
                  editState={{
                    editedScores,
                    newSubject,
                    newScore,
                    onScoreChange: handleScoreChange,
                    onDelete: handleDelete,
                    onNewSubjectChange: setNewSubject,
                    onNewScoreChange: setNewScore,
                    onConfirmAdd: handleConfirmAdd,
                    onCancelAdd: handleCancelAdd,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="p-6 flex justify-center">
              <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-8 w-full max-w-xl">
                <h3 className="font-headline text-base font-semibold text-on-surface mb-6">성적 시각화</h3>
                {radarData.length === 0 ? (
                  <p className="text-center text-on-surface-variant text-sm py-16">
                    등록된 성적이 없습니다.
                  </p>
                ) : (
                  <RadarChart data={radarData} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 일괄 설정 모달 */}
      {bulkTarget && student && (
        <BulkSettingModal
          target={bulkTarget}
          classLabel={`${student.grade}학년 ${student.classNum}반`}
          selectedStudents={classStudents.filter((s: StudentSummary) => selectedIds.includes(s.id))}
          onConfirm={handleBulkConfirm}
          onClose={() => setBulkTarget(null)}
        />
      )}
    </div>
  )
}
