'use client'

import { useState, useEffect } from 'react'
import { Clock, LogIn, LogOut, Coffee, X, Loader2 } from 'lucide-react'
import type { TimeRecord } from '@/app/page'

interface DailyTimeEntryProps {
  onSaveDay: (records: Partial<TimeRecord>[]) => void
  existingRecords: TimeRecord[]
}

interface DailyEntry {
  entry: string
  lunchOut: string
  lunchIn: string
  exit: string
}

export function DailyTimeEntry({ onSaveDay, existingRecords }: DailyTimeEntryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [times, setTimes] = useState<DailyEntry>({
    entry: '',
    lunchOut: '',
    lunchIn: '',
    exit: ''
  })

  const formatDateDisplay = (dateStr: string) => {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!times.entry) {
      alert('Informe pelo menos o horário de entrada!')
      return
    }

    setIsSaving(true)

    try {
      const records: Partial<TimeRecord>[] = []
      const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      })

      const timestamp = Date.now()

      // Período 1 (Manhã): Entrada até Saída para Almoço
      records.push({
        id: `${timestamp}-morning`,
        date: formattedDate,
        clockIn: times.entry,
        clockOut: times.lunchOut || undefined,
        totalMinutes: times.lunchOut ? calculateMinutes(times.entry, times.lunchOut) : undefined,
      })

      // Período 2 (Tarde): Volta do Almoço até Saída Final
      // Só cria o segundo registro se houver volta do almoço OU saída final
      if (times.lunchIn || times.exit) {
        records.push({
          id: `${timestamp}-afternoon`,
          date: formattedDate,
          clockIn: times.lunchIn || times.lunchOut || times.entry, // Fallback se não informar volta
          clockOut: times.exit || undefined,
          totalMinutes: times.exit && times.lunchIn ? calculateMinutes(times.lunchIn, times.exit) : undefined,
        })
      }

      await onSaveDay(records)
      
      // Limpar e fechar
      setTimes({ entry: '', lunchOut: '', lunchIn: '', exit: '' })
      setIsOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  const calculateMinutes = (start: string, end: string): number => {
    const [startH, startM] = start.split(':').map(Number)
    const [endH, endM] = end.split(':').map(Number)
    return (endH * 60 + endM) - (startH * 60 + startM)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white">
              Registro de Ponto
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={isSaving}
            className={`px-3 py-2 sm:px-4 rounded-lg font-semibold transition duration-200 text-sm sm:text-base ${
              isSaving
                ? 'bg-gray-400 cursor-not-allowed'
                : isOpen 
                  ? 'bg-gray-500 hover:bg-gray-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isOpen ? <><X className="w-4 h-4 sm:mr-2 inline" /><span className="hidden sm:inline">Fechar</span></> : '+ Adicionar'}
          </button>
        </div>

        {isOpen && (
          <form onSubmit={handleSubmit} className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formatDateDisplay(date)}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <LogIn className="w-4 h-4 text-green-600" />
                  Entrada *
                </label>
                <input
                  type="time"
                  value={times.entry}
                  onChange={(e) => setTimes({...times, entry: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Coffee className="w-4 h-4 text-orange-600" />
                  Saída Almoço
                </label>
                <input
                  type="time"
                  value={times.lunchOut}
                  onChange={(e) => setTimes({...times, lunchOut: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Coffee className="w-4 h-4 text-green-600" />
                  Volta Almoço
                </label>
                <input
                  type="time"
                  value={times.lunchIn}
                  onChange={(e) => setTimes({...times, lunchIn: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <LogOut className="w-4 h-4 text-red-600" />
                  Saída
                </label>
                <input
                  type="time"
                  value={times.exit}
                  onChange={(e) => setTimes({...times, exit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs sm:text-sm text-blue-800 dark:text-blue-300">
              <strong>Dica:</strong> Preencha apenas os horários que você já tem. Você pode completar depois.
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className={`w-full font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 ${
                isSaving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Registro'
              )}
            </button>
          </form>
        )}

        {!isOpen && (
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
            Clique em Adicionar para registrar seus horários
          </p>
        )}
      </div>
    </div>
  )
}
