import { test, expect, json, mockApiFallback } from './fixtures'
import type { Page } from '@playwright/test'
import type { Note, NoteCategory, Student } from '../src/types'

/**
 * CRUD 모달 대표 케이스 — 학생부(특기사항) 도메인.
 * 추가 모달→목록 반영, 2단계 삭제 확인, 빈 상태. 다른 도메인(피드백/상담/정보수정)도
 * 동일한 모달+낙관/invalidate 패턴이라 학생부를 대표로 검증한다.
 *
 * 노트 mutation은 onSuccess에서 invalidate→refetch 하므로 GET을 stateful하게 만든다.
 */

const STUDENT: Student = { id: 7, name: '홍길동', grade: 2, classNum: 3, number: 7, birthDate: '2010-03-01' }

function note(id: number, content: string, category: NoteCategory = 'ACHIEVEMENT'): Note {
  return { id, studentId: 7, teacherId: 1, category, content, date: '2026-05-01', createdAt: '2026-05-01T09:00:00' }
}

/** 학생 단건 + stateful 노트 CRUD 목킹. */
async function setup(page: Page, initial: Note[]) {
  let notes = initial
  let nextId = 1000
  await mockApiFallback(page)
  await page.route('**/api/students/*', (route) => json(route, STUDENT))
  await page.route('**/api/students/*/notes**', (route) => {
    const req = route.request()
    const method = req.method()
    if (method === 'POST') {
      const body = req.postDataJSON() as { category: NoteCategory; content: string; date: string }
      const created = note(nextId++, body.content, body.category)
      notes = [...notes, created]
      return json(route, created)
    }
    if (method === 'DELETE') {
      const id = Number(new URL(req.url()).pathname.split('/').pop())
      notes = notes.filter((n) => n.id !== id)
      return json(route, {})
    }
    return json(route, notes) // GET
  })
}

test('학생부가 비어 있으면 빈 상태 문구를 보여준다', async ({ page, auth }) => {
  await auth.loginAs('teacher')
  await setup(page, [])

  await page.goto('/students/7/records')

  await expect(page.getByText('등록된 특기사항이 없습니다.')).toBeVisible()
})

test('항목 추가 모달로 저장하면 목록에 반영된다', async ({ page, auth }) => {
  await auth.loginAs('teacher')
  await setup(page, [])

  await page.goto('/students/7/records')
  await page.getByRole('button', { name: '항목 추가' }).click()

  await expect(page.getByRole('heading', { name: '특기사항 추가' })).toBeVisible()
  await page.locator('input[type="date"]').fill('2026-05-01')
  await page.getByPlaceholder('특기사항 내용을 입력하세요.').fill('교내 수학경시대회 금상')
  await page.getByRole('button', { name: '저장' }).click()

  // 모달이 닫히고 새 항목이 목록에 나타난다(POST→invalidate→refetch).
  await expect(page.getByRole('heading', { name: '특기사항 추가' })).toHaveCount(0)
  await expect(page.getByText('교내 수학경시대회 금상')).toBeVisible()
})

test('삭제는 2단계 확인을 거쳐 목록에서 제거된다', async ({ page, auth }) => {
  await auth.loginAs('teacher')
  await setup(page, [note(1, '봉사활동 20시간 이수')])

  await page.goto('/students/7/records')
  await expect(page.getByText('봉사활동 20시간 이수')).toBeVisible()

  // 1단계: 삭제 아이콘(ligature 접근명 "delete") → 확인 문구 노출.
  await page.getByRole('button', { name: 'delete' }).click()
  await expect(page.getByText('이 항목을 삭제할까요?')).toBeVisible()

  // 2단계: 확인 "삭제" → DELETE→refetch→목록에서 사라짐.
  await page.getByRole('button', { name: '삭제', exact: true }).click()

  await expect(page.getByText('봉사활동 20시간 이수')).toHaveCount(0)
  await expect(page.getByText('등록된 특기사항이 없습니다.')).toBeVisible()
})
