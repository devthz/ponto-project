'use client'

import { Calendar, Clock, Trash2, AlertCircle } from 'lucide-react'
import type { TimeRecord } from '@/app/page'

interface TimeHistoryProps {
  records: TimeRecord[]
  onDelete: (id: string) => void
}

export function TimeHistory({ records, onDelete }: TimeHistoryProps) {
  const formatMinutesToHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}min`
  }

  // Agrupar registros por data
  const recordsByDate = records.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = []
    }
    acc[record.date].push(record)
    return acc
  }, {} as Record<string, TimeRecord[]>)

  // Ordenar datas (mais recente primeiro)
  const sortedDates = Object.keys(recordsByDate).sort((a, b) => {
    const dateA = a.split('/').reverse().join('')
    const dateB = b.split('/').reverse().join('')
    return dateB.localeCompare(dateA)
  })

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white mb-4">
        Histórico de Registros
      </h2>

      {records.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum registro ainda. Comece registrando seu ponto!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => {
            const dayRecords = recordsByDate[date]
            const totalMinutes = dayRecords
              .filter(r => r.totalMinutes !== undefined)
              .reduce((sum, r) => sum + (r.totalMinutes || 0), 0)
            const hasIncomplete = dayRecords.some(r => !r.clockOut)

            return (
              <div
                key={date}
                className={`rounded-lg border p-3 sm:p-4 ${
                  hasIncomplete
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span className="font-bold text-gray-800 dark:text-white text-base sm:text-lg">
                      {date}
                    </span>
                    {hasIncomplete && (
                      <span className="px-2 py-1 bg-yellow-200 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-200 text-xs rounded-full font-semibold">
                        Em andamento
                      </span>
                    )}
                  </div>
                  {totalMinutes > 0 && (
                    <div className="flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="font-bold text-indigo-700 dark:text-indigo-300 text-sm">
                        Total: {formatMinutesToHours(totalMinutes)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {dayRecords.map((record, index) => (
                    <div
                      key={record.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-800 p-2 sm:p-3 rounded border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex-1 mb-2 sm:mb-0">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span className="font-medium">
                            {index === 0 ? 'Período 1 (Manhã)' : 'Período 2 (Tarde)'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <strong>{record.clockIn}</strong>
                          </span>
                          {record.clockOut ? (
                            <>
                              <span className="text-gray-400 dark:text-gray-500">→</span>
                              <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                <strong>{record.clockOut}</strong>
                              </span>
                              <span className="text-gray-500 dark:text-gray-400">
                                ({formatMinutesToHours(record.totalMinutes || 0)})
                              </span>
                            </>
                          ) : (
                            <span className="text-yellow-600 dark:text-yellow-400 text-xs italic">
                              Aguardando saída...
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir este período?')) {
                            onDelete(record.id)
                          }
                        }}
                        className="w-full sm:w-auto px-2 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded transition duration-200 text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span className="hidden sm:inline">Excluir</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
