# Stitch 작업 가이드

## 프로젝트 정보

| 항목 | 값 |
|------|-----|
| 프로젝트명 | EduManager |
| 프로젝트 ID | `15356410440219844399` |
| 디바이스 타입 | DESKTOP |
| 기본 모델 | GEMINI_3_1_PRO |

---

## 화면 목록

### 최종 화면 (사용)

| 화면명 | Screen ID |
|--------|-----------|
| EduManager 로그인 (통합) | `6d201c643c6f4ba0af39821ee6fe63da` |
| EduManager 로그인 (통합) | `6d201c643c6f4ba0af39821ee6fe63da` |
| EduManager 교사 로그인 | `e9e7ba604a9041ed88feb8b991078ddc` |
| EduManager 학생 로그인 | `112cc88135c24c4a9b1b215111ed3160` |
| EduManager 학부모 로그인 | `4ecad3551aea4f5fa320a573be35b17a` |
| EduManager 교사 회원가입 | `140dc97fee544755ad0c596151c6c040` |
| EduManager 학생 회원가입 | `1be46a26ccea43af8b68c7cbcb78bcc4` |
| EduManager 학부모 회원가입 | `8911a37e4f9944f1a7b5bfe3b5b3b37f` |

### 원본 화면 (참고용 / Stitch에서 삭제 예정)

| 화면명 | Screen ID |
|--------|-----------|
| 로그인 페이지 (한글) | `a970048760e84f598f9dff6b3d634e98` |
| 학생 로그인 (역할 선택 추가) | `4147211c060c4e9db0c5df22e5cb396e` |
| 학부모 로그인 (역할 선택 추가) | `10b89fd56d4d4b3e983fc3da4347d600` |
| 교사 회원가입 (심플) | `4af83b4260e5413d969d0e5d51b40de5` |
| 학생 회원가입 (역할 선택 추가) | `c4fa69c5999d439580078a86739fa0a0` |
| 학부모 회원가입 (역할 선택 추가) | `e9adf7b0a8d84a57a3ba11ddb7db0fa8` |

---

## 디자인 시스템 토큰

### 색상

| 토큰 | 값 | 용도 |
|------|----|------|
| `primary` | `#455f88` | 주요 액션, 활성 탭 |
| `primary-dim` | `#39537c` | 호버 상태 |
| `primary-fixed-dim` | `#bfd5ff` | 입력 필드 하단 border |
| `surface` | `#f7fafc` | 기본 배경 |
| `surface-container-lowest` | `#ffffff` | 카드 배경 |
| `surface-container-low` | `#eff4f7` | 입력 필드 배경 |
| `surface-container` | `#e7eff3` | 섹션 배경 |
| `on-surface` | `#283439` | 본문 텍스트 |
| `on-surface-variant` | `#546166` | 보조 텍스트, 레이블 |
| `on-primary` | `#f6f7ff` | 주요 버튼 텍스트 |
| `error` | `#9f403d` | 에러 상태 |

### 타이포그래피

| 용도 | 폰트 | 크기 | 두께 |
|------|------|------|------|
| 헤드라인 | Manrope | `text-3xl` | `font-bold` |
| 섹션 제목 | Manrope | `text-xl` | `font-semibold` |
| 본문 | Inter / Pretendard | `text-sm` (0.875rem) | `font-normal` |
| 레이블 | Inter | `text-xs` (0.75rem) | `font-medium`, uppercase |

---

## 공통 UI 규칙

### 레이아웃
- 헤더: `sticky top-0 z-50`, 브랜드명(좌) + 도움말 링크(우)만
- 카드 너비: 로그인=`max-w-md`, 회원가입=`max-w-lg`
- 카드 스타일: `bg-surface-container-lowest rounded-xl shadow`
- 배경: 불필요한 장식 요소(블러 원형, 그라디언트 배너) 없음

### 역할 탭 (교사/학생/학부모)
- 방식: 언더라인 (활성: `border-b-2 border-primary`, 비활성: 텍스트만)
- 너비: `flex-1` (카드 전체 너비 꽉 채움)
- 위치: 카드 최상단

### 입력 필드
- 배경: `bg-surface-container-low`
- 테두리: 하단만 `border-b-2 border-primary-fixed-dim`
- 레이블: `text-xs uppercase tracking-wider text-on-surface-variant`
- 포커스: 배경 `bg-surface-container-lowest`

### 버튼
- 주요 버튼: `bg-primary hover:bg-primary-dim text-on-primary font-bold py-4 rounded-lg w-full`
- 로그인 버튼 텍스트: `"로그인"`
- 회원가입 버튼 텍스트: `"가입 신청하기"`

### 약관 동의 (회원가입)
- 이용약관, 개인정보 처리방침 **개별** 체크박스 (하나로 묶지 않음)
- 형식: `[필수] OO에 동의합니다` + `"보기"` 링크

### 푸터
- 저작권: `© 2025 EduManager. 모든 권리 보유.`
- 링크: 개인정보 처리방침 | 이용약관 | 고객지원

---

## 프롬프트 템플릿

### 신규 화면 생성 (`generate_screen_from_text`)

```
다음 규칙을 따르는 [화면명] 화면을 만들어줘:

**공통 규칙**
- 브랜드명: EduManager
- 헤더: sticky top-0 z-50, 좌측 브랜드명, 우측 "도움말" 링크만
- 역할 탭(교사/학생/학부모): 언더라인 방식, flex-1
- 카드: bg-surface-container-lowest rounded-xl shadow, max-w-[md/lg]
- 입력 필드: bg-surface-container-low + border-b-2 border-primary-fixed-dim
- 버튼: bg-primary hover:bg-primary-dim text-on-primary font-bold py-4 rounded-lg w-full
- 푸터: "© 2025 EduManager. 모든 권리 보유." + 개인정보 처리방침, 이용약관, 고객지원
- 색상 토큰: primary=#455f88, surface=#f7fafc, on-surface=#283439
- 폰트: 헤드라인=Manrope, 본문=Inter
- 장식 요소 없음 (블러, 배경 그라디언트 금지)
- 구분선 금지, 배경색 변화로 영역 구분

**이 화면의 특징**
[화면별 특이사항 작성]
```

### 기존 화면 수정 (`edit_screens`)

```
다음 사항을 수정해줘:

[수정 내용 목록]

공통 규칙 유지:
- 브랜드명: EduManager
- 헤더: sticky top-0 z-50, "도움말" 링크만
- 역할 탭: 언더라인, flex-1
- 입력 필드: border-b-2 border-primary-fixed-dim
- 푸터: © 2025 EduManager. 모든 권리 보유. + 개인정보 처리방침, 이용약관, 고객지원
```

---

## 아직 필요한 화면 목록

> 새로 생성 필요

| 화면명 | 비고 |
|--------|------|
| ~~교사 로그인~~ | ✅ 완료 (`1ec196a7ad88400f946c3e112bcf015e`) |
| 교사 대시보드 | 메인 화면, SCR-8/9 기반 |
| 학생 목록 | SCR-10, SCR-21 |
| 성적 입력 | SCR-5, SCR-6 |
| 학생 상세 / 학생부 | SCR-10~13 |
| 피드백 작성 | SCR-14, SCR-16 |
| 상담 기록 | SCR-17~20 |
| 알림 | SCR-24~26 |
| 보고서 | SCR-27~30 |
