import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/features/auth'
import { AppLayout } from '@/layouts/AppLayout'
import { StudentDetailLayout } from '@/layouts/StudentDetailLayout'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { OAuthCompletePage } from '@/pages/OAuthCompletePage'
import { OAuthKakaoCallbackPage } from '@/pages/OAuthKakaoCallbackPage'
import { StudentsPage } from '@/pages/StudentsPage'
import { GradesTabPage } from '@/pages/GradesTabPage'
import { StudentGradesPage } from '@/pages/StudentGradesPage'
import { ParentGradesPage } from '@/pages/ParentGradesPage'
import { PlaceholderTabPage } from '@/pages/PlaceholderTabPage'
import { InfoTabPage } from '@/pages/InfoTabPage'
import { AttendanceTabPage } from '@/pages/AttendanceTabPage'
import { RecordsTabPage } from '@/pages/RecordsTabPage'
import { FeedbackTabPage } from '@/pages/FeedbackTabPage'
import { StudentFeedbackPage } from '@/pages/StudentFeedbackPage'
import { ParentFeedbackPage } from '@/pages/ParentFeedbackPage'
import { CounselingTabPage } from '@/pages/CounselingTabPage'
import { SharedCounselingPage } from '@/pages/SharedCounselingPage'
import { NotificationsPage } from '@/pages/NotificationsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* 루트 */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 인증 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup/:role" element={<SignupPage />} />
          <Route path="/signup" element={<Navigate to="/signup/teacher" replace />} />
          <Route path="/oauth/kakao/callback" element={<OAuthKakaoCallbackPage />} />
          <Route path="/oauth/complete" element={<OAuthCompletePage />} />

          {/* 교사 — 학생 목록 (사이드바 포함) */}
          <Route element={<AppLayout />}>
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/shared-counseling" element={<SharedCounselingPage />} />
            <Route path="/dashboard" element={<Navigate to="/students" replace />} />
          </Route>

          {/* 교사 — 학생 상세 (전체 화면, 탭 바 고정) */}
          <Route path="/students/:studentId" element={<StudentDetailLayout />}>
            <Route index element={<Navigate to="grades" replace />} />
            <Route path="info" element={<InfoTabPage />} />
            <Route path="grades" element={<GradesTabPage />} />
            <Route path="attendance" element={<AttendanceTabPage />} />
            <Route path="records" element={<RecordsTabPage />} />
            <Route path="feedback" element={<FeedbackTabPage />} />
            <Route path="counseling" element={<CounselingTabPage />} />
          </Route>

          {/* 학생 */}
          <Route element={<AppLayout />}>
            <Route path="/student/grades" element={<StudentGradesPage />} />
            <Route path="/student/records" element={<PlaceholderTabPage tabName="학생부" />} />
            <Route path="/student/feedback" element={<StudentFeedbackPage />} />
            <Route path="/student/notifications" element={<NotificationsPage />} />
          </Route>

          {/* 학부모 */}
          <Route element={<AppLayout />}>
            <Route path="/parent/grades" element={<ParentGradesPage />} />
            <Route path="/parent/records" element={<PlaceholderTabPage tabName="학생부" />} />
            <Route path="/parent/feedback" element={<ParentFeedbackPage />} />
            <Route path="/parent/notifications" element={<NotificationsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
