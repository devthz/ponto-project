'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { LogIn, LayoutDashboard, History, Settings } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { Auth } from '@/components/Auth'
import { ClockConfig } from '@/components/ClockConfig'
import { DailyTimeEntry } from '@/components/DailyTimeEntry'
import { TimeHistory } from '@/components/TimeHistory'
import { HourBank } from '@/components/HourBank'
import { QuickClockIn } from '@/components/QuickClockIn'

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'config'>('dashboard')

  // Função para carregar dados do Supabase
  const loadUserData = useCallback(async (forceReload = false, silent = false) => {
    if (!user) {
      setRecords([])
      setConfig({ dailyHours: 8, weeklyHours: 40 })
      setLoading(false)
      setDataLoaded(false)
      return
    }
    
    // Evitar carregar múltiplas vezes (a menos que force reload)
    if (dataLoaded && !forceReload) return
    
    try {
      // Só mostra loading se não for silent
      if (!silent) {
        setLoading(true)
      }
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
      // Só desativa loading se não for silent
      if (!silent) {
        setLoading(false)
      }
    }
  }, [user, dataLoaded])

  // useEffect para carregar dados quando usuário faz login
  useEffect(() => {
    loadUserData()
  }, [loadUserData])

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
    if (user) {
      const { error } = await supabase
        .from('time_records')
        .insert({
          id: record.id,
          user_id: user.id,
          date: record.date,
          clock_in: record.clockIn,
          clock_out: record.clockOut || null,
          total_minutes: record.totalMinutes || null,
        })
      
      if (!error) {
        // Recarregar dados do banco após inserir (modo silencioso)
        await loadUserData(true, true)
      }
    } else {
      // Se não houver usuário, apenas atualiza localmente
      const newRecords = [record, ...records]
      setRecords(newRecords)
    }
  }

  // Registro rápido - pode criar ou atualizar
  const quickClockIn = async (record: Partial<TimeRecord>) => {
    console.log('quickClockIn chamado com:', record)
    
    // Verificar se existe um registro com esse ID
    const existingRecord = records.find(r => r.id === record.id)
    
    if (existingRecord && record.clockOut) {
      // ATUALIZAR: registro existe e tem clockOut no parâmetro
      console.log('Atualizando registro existente:', existingRecord.id)
      const [inH, inM] = existingRecord.clockIn.split(':').map(Number)
      const [outH, outM] = record.clockOut.split(':').map(Number)
      const totalMinutes = (outH * 60 + outM) - (inH * 60 + inM)
      
      await updateRecord(record.id!, record.clockOut, totalMinutes)
    } else {
      // CRIAR: novo registro
      console.log('Criando novo registro')
      const newRecord: TimeRecord = {
        id: record.id || `${Date.now()}-quick`,
        date: record.date || '',
        clockIn: record.clockIn || '',
        clockOut: undefined,
        totalMinutes: undefined,
        user_id: user?.id,
      }
      await addRecord(newRecord)
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

  // Editar registro completo (entrada e saída)
  const editRecord = async (id: string, clockIn: string, clockOut?: string) => {
    let totalMinutes: number | undefined
    
    if (clockOut) {
      const [inH, inM] = clockIn.split(':').map(Number)
      const [outH, outM] = clockOut.split(':').map(Number)
      totalMinutes = (outH * 60 + outM) - (inH * 60 + inM)
    }

    const updatedRecords = records.map((record: TimeRecord) =>
      record.id === id ? { ...record, clockIn, clockOut, totalMinutes } : record
    )
    setRecords(updatedRecords)
    
    if (user) {
      await supabase
        .from('time_records')
        .update({
          clock_in: clockIn,
          clock_out: clockOut || null,
          total_minutes: totalMinutes || null,
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

  // Função para pegar últimos 5 dias de registros para o dashboard
  const getRecentRecords = () => {
    const recordsByDate = records.reduce((acc, record) => {
      if (!acc[record.date]) {
        acc[record.date] = []
      }
      acc[record.date].push(record)
      return acc
    }, {} as Record<string, TimeRecord[]>)
    
    const sortedDates = Object.keys(recordsByDate).sort((a, b) => {
      const dateA = a.split('/').reverse().join('')
      const dateB = b.split('/').reverse().join('')
      return dateB.localeCompare(dateA)
    })
    
    const last5Dates = sortedDates.slice(0, 5)
    return records.filter(r => last5Dates.includes(r.date))
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
            {/* Navegação por Abas */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-4 sm:mb-6 overflow-hidden">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 px-4 font-semibold text-sm sm:text-base transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 px-4 font-semibold text-sm sm:text-base transition-colors ${
                    activeTab === 'history'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <History className="w-5 h-5" />
                  <span className="hidden sm:inline">Histórico</span>
                </button>
                <button
                  onClick={() => setActiveTab('config')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 px-4 font-semibold text-sm sm:text-base transition-colors ${
                    activeTab === 'config'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span className="hidden sm:inline">Configurações</span>
                </button>
              </div>
            </div>

            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <>
                <QuickClockIn 
                  onClockIn={quickClockIn}
                  existingRecords={records}
                />
                
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 my-4 sm:my-6">
                  <DailyTimeEntry 
                    onSaveDay={async (newRecords) => {
                      for (const record of newRecords) {
                        await addRecord(record as TimeRecord)
                      }
                    }}
                    existingRecords={records}
                  />

                  <HourBank records={records} config={config} />
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white">
                      Últimos Registros
                    </h2>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                    >
                      Ver todos →
                    </button>
                  </div>
                  <TimeHistory 
                    records={getRecentRecords()}
                    onDelete={deleteRecord}
                    onEdit={editRecord}
                    showTitle={false}
                  />
                </div>
              </>
            )}

            {/* Histórico Completo */}
            {activeTab === 'history' && (
              <TimeHistory 
                records={records}
                onDelete={deleteRecord}
                onEdit={editRecord}
                showTitle={true}
              />
            )}

            {/* Configurações */}
            {activeTab === 'config' && (
              <ClockConfig config={config} onSave={saveConfig} />
            )}
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
