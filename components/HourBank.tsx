'use client'

import { Calendar, Clock, Target, TrendingUp, TrendingDown } from 'lucide-react'
import type { TimeRecord, WorkConfig } from '@/app/page'

interface HourBankProps {
  records: TimeRecord[]
  config: WorkConfig
}

export function HourBank({ records, config }: HourBankProps) {
  const calculateHourBank = () => {
    // Agrupar registros por data
    const recordsByDate = records.reduce((acc, record) => {
      if (!acc[record.date]) {
        acc[record.date] = []
      }
      acc[record.date].push(record)
      return acc
    }, {} as Record<string, TimeRecord[]>)
    
    // Calcular minutos trabalhados por dia
    let totalWorkedMinutes = 0
    let totalExpectedMinutes = 0
    let daysWorked = 0
    
    Object.entries(recordsByDate).forEach(([date, dayRecords]) => {
      // Somar todos os períodos do dia (manhã + tarde)
      const dayMinutes = dayRecords
        .filter(r => r.totalMinutes !== undefined)
        .reduce((sum, r) => sum + (r.totalMinutes || 0), 0)
      
      // Só conta como dia trabalhado se tiver algum registro completo
      if (dayMinutes > 0) {
        totalWorkedMinutes += dayMinutes
        daysWorked++
        
        // Verificar se é sexta-feira
        const [day, month, year] = date.split('/').map(Number)
        const dateObj = new Date(year, month - 1, day)
        const isFriday = dateObj.getDay() === 5
        
        // Se for sexta, considerar 8h, senão usar a configuração
        const expectedHours = isFriday ? 8 : config.dailyHours
        totalExpectedMinutes += expectedHours * 60
      }
    })
    
    // Diferença (banco de horas em minutos)
    const bankMinutes = totalWorkedMinutes - totalExpectedMinutes
    
    return {
      totalWorkedMinutes,
      expectedMinutes: totalExpectedMinutes,
      bankMinutes,
      daysWorked,
    }
  }

  const formatMinutesToHours = (minutes: number) => {
    const absMinutes = Math.abs(minutes)
    const hours = Math.floor(absMinutes / 60)
    const mins = absMinutes % 60
    const sign = minutes >= 0 ? '+' : '-'
    return `${sign}${hours}h ${mins}min`
  }

  const formatTotalHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}min`
  }

  const stats = calculateHourBank()
  const isPositive = stats.bankMinutes >= 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-4 sm:mb-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white mb-4 sm:mb-6">
        Banco de Horas
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 border border-blue-100 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">Dias Trabalhados</div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-300">
            {stats.daysWorked}
          </div>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 sm:p-4 border border-indigo-100 dark:border-indigo-800">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <div className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-medium">Horas Trabalhadas</div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-indigo-700 dark:text-indigo-300">
            {formatTotalHours(stats.totalWorkedMinutes)}
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 sm:p-4 border border-purple-100 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <div className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium">Horas Esperadas</div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-purple-700 dark:text-purple-300">
            {formatTotalHours(stats.expectedMinutes)}
          </div>
        </div>

        <div className={`rounded-lg p-3 sm:p-4 border ${
          isPositive 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
            )}
            <div className={`text-xs sm:text-sm font-medium ${
              isPositive 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              Saldo do Banco
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-bold ${
            isPositive 
              ? 'text-green-700 dark:text-green-300' 
              : 'text-red-700 dark:text-red-300'
          }`}>
            {formatMinutesToHours(stats.bankMinutes)}
          </div>
        </div>
      </div>

      {stats.daysWorked === 0 && (
        <div className="mt-4 text-center text-gray-500 dark:text-gray-400 italic">
          Nenhum registro completo ainda. Registre sua entrada e saída para começar!
        </div>
      )}
    </div>
  )
}
