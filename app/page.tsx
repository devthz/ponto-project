'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { LogIn } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { Auth } from '@/components/Auth'
import { ClockConfig } from '@/components/ClockConfig'
import { DailyTimeEntry } from '@/components/DailyTimeEntry'
import { TimeHistory } from '@/components/TimeHistory'
import { HourBank } from '@/components/HourBank'

export interface TimeRecord {
  id: string
  date: string
  clockIn: string
  clockOut?: string
  totalMinutes?: number
  user_id?: string
}

export interface WorkConfig {
  dailyHours: number
  weeklyHours: number
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [config, setConfig] = useState<WorkConfig>({ dailyHours: 8, weeklyHours: 40 })
  const [records, setRecords] = useState<TimeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Carregar dados do Supabase quando usuário fizer login
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setRecords([])
        setConfig({ dailyHours: 8, weeklyHours: 40 })
        setLoading(false)
        setDataLoaded(false)
        return
      }
      
      // Evitar carregar múltiplas vezes
      if (dataLoaded) return
      
      try {
        setLoading(true)
        console.log('Carregando dados do usuário...')
        
        // Carregar configuração
        const { data: configData, error: configError } = await supabase
          .from('work_config')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
        
        if (configError) {
          console.error('Erro ao carregar config:', configError)
        } else if (configData) {
          setConfig({
            dailyHours: configData.daily_hours,
            weeklyHours: configData.weekly_hours,
          })
        }

        // Carregar registros
        const { data: recordsData, error: recordsError } = await supabase
          .from('time_records')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (recordsError) {
          console.error('Erro ao carregar registros:', recordsError)
        } else if (recordsData) {
          setRecords(recordsData.map((r: any) => ({
            id: r.id,
            date: r.date,
            clockIn: r.clock_in,
            clockOut: r.clock_out,
            totalMinutes: r.total_minutes,
            user_id: r.user_id,
          })))
        }
        
        setDataLoaded(true)
        console.log('Dados carregados com sucesso!')
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [user, dataLoaded])

  // Salvar configuração
  const saveConfig = async (newConfig: WorkConfig) => {
    setConfig(newConfig)
    
    if (user) {
      await supabase
        .from('work_config')
        .upsert({
          user_id: user.id,
          daily_hours: newConfig.dailyHours,
          weekly_hours: newConfig.weeklyHours,
        })
    }
  }

  // Adicionar novo registro
  const addRecord = async (record: TimeRecord) => {
    const newRecords = [record, ...records]
    setRecords(newRecords)
    
    if (user) {
      await supabase
        .from('time_records')
        .insert({
          id: record.id,
          user_id: user.id,
          date: record.date,
          clock_in: record.clockIn,
        })
    }
  }

  // Atualizar registro existente
  const updateRecord = async (id: string, clockOut: string, totalMinutes: number) => {
    const updatedRecords = records.map((record: TimeRecord) =>
      record.id === id ? { ...record, clockOut, totalMinutes } : record
    )
    setRecords(updatedRecords)
    
    if (user) {
      await supabase
        .from('time_records')
        .update({
          clock_out: clockOut,
          total_minutes: totalMinutes,
        })
        .eq('id', id)
    }
  }

  // Deletar registro
  const deleteRecord = async (id: string) => {
    const filteredRecords = records.filter((record: TimeRecord) => record.id !== id)
    setRecords(filteredRecords)
    
    if (user) {
      await supabase
        .from('time_records')
        .delete()
        .eq('id', id)
    }
  }

  if (loading && user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center py-20">
          <div className="text-indigo-600 dark:text-indigo-400 text-4xl mb-4">⏳</div>
          <p className="text-gray-600 dark:text-gray-300">Carregando seus dados...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Controle de Ponto
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Gerencie seu tempo e banco de horas com sincronização na nuvem
          </p>
        </div>

        <Auth onAuthChange={setUser} />

        {user && (
          <>
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 mb-4 sm:mb-6">
              <ClockConfig config={config} onSave={saveConfig} />
              <DailyTimeEntry 
                onSaveDay={(newRecords) => {
                  newRecords.forEach(record => addRecord(record as TimeRecord))
                }}
                existingRecords={records}
              />
            </div>

            <HourBank records={records} config={config} />
            
            <TimeHistory 
              records={records}
              onDelete={deleteRecord}
            />
          </>
        )}

        {!user && (
          <div className="text-center py-8 sm:py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            <LogIn className="w-16 h-16 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white mb-2">
              Faça login para começar
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Seus dados serão sincronizados automaticamente entre todos os seus dispositivos!
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
