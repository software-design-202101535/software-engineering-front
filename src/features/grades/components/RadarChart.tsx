interface RadarChartProps {
  data: { subject: string; score: number | null }[]
}

const GRADE_COLORS: Record<string, string> = {
  A: '#455f88',
  B: '#5d7a9b',
  C: '#8fa8c2',
  D: '#bfd5ff',
  F: '#fe8983',
}

function scoreToGradeLetter(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

export function RadarChart({ data }: RadarChartProps) {
  const scoredData = data.filter((d) => d.score !== null) as { subject: string; score: number }[]
  if (scoredData.length < 3) {
    return (
      <div className="flex items-center justify-center h-64 text-on-surface-variant text-sm">
        과목이 3개 이상이어야 차트를 표시할 수 있습니다.
      </div>
    )
  }

  const cx = 200
  const cy = 200
  const r = 140
  const n = scoredData.length
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0]
  const levelLabels = [20, 40, 60, 80, 100]

  const angles = scoredData.map((_, i) => (i * 2 * Math.PI) / n - Math.PI / 2)

  const gridPoints = (ratio: number) =>
    angles
      .map((a) => `${(cx + r * ratio * Math.cos(a)).toFixed(1)},${(cy + r * ratio * Math.sin(a)).toFixed(1)}`)
      .join(' ')

  const scorePoints = scoredData
    .map((d, i) => {
      const ratio = Math.min(d.score, 100) / 100
      return `${(cx + r * ratio * Math.cos(angles[i])).toFixed(1)},${(cy + r * ratio * Math.sin(angles[i])).toFixed(1)}`
    })
    .join(' ')

  const avg = Math.round(scoredData.reduce((sum, d) => sum + d.score, 0) / scoredData.length)

  return (
    <div className="flex flex-col items-center gap-6">
      <svg width="400" height="400" viewBox="0 0 400 400" className="overflow-visible">
        {/* 배경 격자 */}
        {levels.map((level, i) => (
          <polygon
            key={level}
            points={gridPoints(level)}
            fill={i === levels.length - 1 ? 'none' : 'none'}
            stroke="#e7eff3"
            strokeWidth="1"
          />
        ))}

        {/* 축 선 */}
        {angles.map((a, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={(cx + r * Math.cos(a)).toFixed(1)}
            y2={(cy + r * Math.sin(a)).toFixed(1)}
            stroke="#a7b4ba"
            strokeWidth="1"
          />
        ))}

        {/* 레벨 레이블 (60, 80, 100) */}
        {[0.6, 0.8, 1.0].map((level, i) => (
          <text
            key={level}
            x={cx + 4}
            y={(cy - r * level).toFixed(1)}
            fontSize="10"
            fill="#a7b4ba"
            fontFamily="Inter"
          >
            {levelLabels[i + 2]}
          </text>
        ))}

        {/* 점수 폴리곤 */}
        <polygon points={scorePoints} fill="rgba(69,95,136,0.15)" stroke="#455f88" strokeWidth="2" />

        {/* 점수 도트 */}
        {scoredData.map((d, i) => {
          const ratio = Math.min(d.score, 100) / 100
          const x = cx + r * ratio * Math.cos(angles[i])
          const y = cy + r * ratio * Math.sin(angles[i])
          return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="5" fill="#455f88" />
        })}

        {/* 과목 레이블 */}
        {scoredData.map((d, i) => {
          const labelR = r + 22
          const x = cx + labelR * Math.cos(angles[i])
          const y = cy + labelR * Math.sin(angles[i])
          const cosA = Math.cos(angles[i])
          const anchor = Math.abs(cosA) < 0.15 ? 'middle' : cosA > 0 ? 'start' : 'end'
          return (
            <text
              key={i}
              x={x.toFixed(1)}
              y={y.toFixed(1)}
              textAnchor={anchor}
              dominantBaseline="middle"
              fill="#546166"
              fontSize="12"
              fontFamily="Inter"
              fontWeight="500"
            >
              {d.subject}
            </text>
          )
        })}
      </svg>

      {/* 과목별 점수 요약 */}
      <div className="w-full max-w-sm">
        <div className="flex justify-between items-center mb-3 px-1">
          <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">과목별 점수</span>
          <span className="text-sm font-semibold text-primary">평균 {avg}점</span>
        </div>
        <div className="space-y-2">
          {scoredData.map((d) => {
            const letter = scoreToGradeLetter(d.score)
            return (
              <div key={d.subject} className="flex items-center gap-3">
                <span className="w-14 text-sm text-on-surface-variant text-right shrink-0">{d.subject}</span>
                <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${d.score}%`,
                      backgroundColor: GRADE_COLORS[letter] ?? '#455f88',
                    }}
                  />
                </div>
                <span className="w-8 text-sm font-semibold text-on-surface text-right shrink-0">{d.score}</span>
                <span
                  className="w-12 text-xs font-bold text-center py-0.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: `${GRADE_COLORS[letter]}20`,
                    color: GRADE_COLORS[letter],
                  }}
                >
                  {letter}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
