'use client'

import { useState, useEffect } from 'react'
import { Clock, Zap } from 'lucide-react'
import type { TimeRecord } from '@/app/page'

interface QuickClockInProps {
  onClockIn: (record: Partial<TimeRecord>) => Promise<void>
  existingRecords: TimeRecord[]
}

export function QuickClockIn({ onClockIn, existingRecords }: QuickClockInProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isRegistering, setIsRegistering] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  const formatTimeForRecord = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit'
    })
  }

  const getTodayRecords = () => {
    const today = formatDate(new Date())
    return existingRecords.filter(r => r.date === today).sort((a, b) => {
      // Ordenar por hora de entrada (clockIn)
      return a.clockIn.localeCompare(b.clockIn)
    })
  }

  const getNextAction = () => {
    const todayRecords = getTodayRecords()
    
    console.log('Registros de hoje:', todayRecords)
    
    // Nenhum registro ainda - registrar entrada
    if (todayRecords.length === 0) {
      return { action: 'Registrar Entrada', type: 'morning-in' }
    }
    
    // Tem 1 registro (período manhã)
    if (todayRecords.length === 1) {
      const firstRecord = todayRecords[0]
      
      // Se não tem saída, registrar saída para almoço
      if (!firstRecord.clockOut) {
        return { action: 'Registrar Saída para Almoço', type: 'morning-out' }
      }
      
      // Se já tem saída, registrar volta do almoço
      return { action: 'Registrar Volta do Almoço', type: 'afternoon-in' }
    }
    
    // Tem 2 registros (manhã e tarde)
    if (todayRecords.length === 2) {
      const secondRecord = todayRecords[1]
      
      // Se o segundo não tem saída, registrar saída final
      if (!secondRecord.clockOut) {
        return { action: 'Registrar Saída', type: 'afternoon-out' }
      }
      
      // Já tem tudo completo
      return { action: 'Dia Completo!', type: 'complete' }
    }
    
    // Mais de 2 registros (não deveria acontecer, mas...)
    return { action: 'Dia Completo!', type: 'complete' }
  }

  const handleQuickRegister = async () => {
    const nextAction = getNextAction()
    
    if (nextAction.type === 'complete') {
      alert('Você já completou todos os registros de hoje!')
      return
    }

    setIsRegistering(true)

    try {
      const now = new Date()
      const today = formatDate(now)
      const time = formatTimeForRecord(now)
      const todayRecords = getTodayRecords()

      console.log('Registrando ponto:', { nextAction, today, time, todayRecords })

      if (nextAction.type === 'morning-in') {
        // 1. Criar novo registro de manhã (entrada)
        console.log('Criando registro de entrada manhã')
        await onClockIn({
          id: `${Date.now()}-morning`,
          date: today,
          clockIn: time,
        })
      } else if (nextAction.type === 'morning-out') {
        // 2. Atualizar primeiro registro com saída para almoço
        const firstRecord = todayRecords[0]
        console.log('Atualizando saída para almoço:', firstRecord)
        if (firstRecord) {
          await onClockIn({
            id: firstRecord.id,
            date: firstRecord.date,
            clockIn: firstRecord.clockIn,
            clockOut: time,
          })
        }
      } else if (nextAction.type === 'afternoon-in') {
        // 3. Criar novo registro de tarde (volta do almoço)
        console.log('Criando registro de volta do almoço')
        await onClockIn({
          id: `${Date.now()}-afternoon`,
          date: today,
          clockIn: time,
        })
      } else if (nextAction.type === 'afternoon-out') {
        // 4. Atualizar segundo registro com saída final
        const secondRecord = todayRecords[1]
        console.log('Atualizando saída final:', secondRecord)
        if (secondRecord) {
          await onClockIn({
            id: secondRecord.id,
            date: secondRecord.date,
            clockIn: secondRecord.clockIn,
            clockOut: time,
          })
        }
      }
      
      console.log('Ponto registrado com sucesso!')
    } catch (error) {
      console.error('Erro ao registrar ponto:', error)
      alert('Erro ao registrar ponto. Tente novamente.')
    } finally {
      setIsRegistering(false)
    }
  }

  const nextAction = getNextAction()

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg border border-indigo-400 p-4 sm:p-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-white/20 rounded-lg">
          <Zap className="w-6 h-6" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold">
          Registro Rápido
        </h2>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
        <div className="text-center">
          <div className="text-xs sm:text-sm opacity-90 mb-1">
            {formatDate(currentTime)}
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono tracking-wider">
            {formatTime(currentTime)}
          </div>
        </div>
      </div>

      <button
        onClick={handleQuickRegister}
        disabled={isRegistering || nextAction.type === 'complete'}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
          nextAction.type === 'complete'
            ? 'bg-green-500/50 cursor-not-allowed'
            : isRegistering
              ? 'bg-white/20 cursor-not-allowed'
              : 'bg-white text-indigo-600 hover:bg-white/90 shadow-lg hover:shadow-xl transform hover:scale-105'
        }`}
      >
        {isRegistering ? (
          <>
            <Clock className="w-5 h-5 animate-spin" />
            Registrando...
          </>
        ) : (
          <>
            <Clock className="w-5 h-5" />
            {nextAction.action}
          </>
        )}
      </button>

      {nextAction.type === 'complete' && (
        <p className="text-center text-xs sm:text-sm mt-3 opacity-90">
          ✅ Todos os pontos do dia foram registrados!
        </p>
      )}
    </div>
  )
}
