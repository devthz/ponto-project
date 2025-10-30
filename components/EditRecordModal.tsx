'use client'

import { useState } from 'react'
import { Edit2, Save, X } from 'lucide-react'
import type { TimeRecord } from '@/app/page'

interface EditRecordModalProps {
  record: TimeRecord
  onSave: (id: string, clockIn: string, clockOut: string | undefined) => void
  onClose: () => void
}

export function EditRecordModal({ record, onSave, onClose }: EditRecordModalProps) {
  const [clockIn, setClockIn] = useState(record.clockIn)
  const [clockOut, setClockOut] = useState(record.clockOut || '')

  const handleSave = () => {
    if (!clockIn) {
      alert('Informe o horário de entrada!')
      return
    }

    // Validar se saída é depois da entrada
    if (clockOut) {
      const [inH, inM] = clockIn.split(':').map(Number)
      const [outH, outM] = clockOut.split(':').map(Number)
      const inMinutes = inH * 60 + inM
      const outMinutes = outH * 60 + outM

      if (outMinutes <= inMinutes) {
        alert('Horário de saída deve ser depois da entrada!')
        return
      }
    }

    onSave(record.id, clockIn, clockOut || undefined)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Editar Registro
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Data: <strong className="text-gray-800 dark:text-white">{record.date}</strong>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Horário de Entrada *
            </label>
            <input
              type="time"
              value={clockIn}
              onChange={(e) => setClockIn(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Horário de Saída
            </label>
            <input
              type="time"
              value={clockOut}
              onChange={(e) => setClockOut(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
