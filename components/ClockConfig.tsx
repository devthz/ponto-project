'use client'

import { useState } from 'react'
import { Settings, Save, X } from 'lucide-react'
import type { WorkConfig } from '@/app/page'

interface ClockConfigProps {
  config: WorkConfig
  onSave: (config: WorkConfig) => void
}

export function ClockConfig({ config, onSave }: ClockConfigProps) {
  const [dailyHours, setDailyHours] = useState(config.dailyHours)
  const [weeklyHours, setWeeklyHours] = useState(config.weeklyHours)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    onSave({ dailyHours, weeklyHours })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setDailyHours(config.dailyHours)
    setWeeklyHours(config.weeklyHours)
    setIsEditing(false)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white">
            Carga Horária
          </h2>
        </div>
      
      {!isEditing ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Horas por dia:</span>
            <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
              {config.dailyHours}h
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Horas por semana:</span>
            <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
              {config.weeklyHours}h
            </span>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Editar Configuração
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Horas por dia
            </label>
            <input
              type="number"
              min="1"
              max="24"
              step="0.5"
              value={dailyHours}
              onChange={(e) => setDailyHours(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Horas por semana
            </label>
            <input
              type="number"
              min="1"
              max="168"
              step="0.5"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
