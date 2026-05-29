import React, { useState, useEffect } from 'react';
import { Birthday } from '../types.ts';
import { X, Calendar, User, Save } from 'lucide-react';

interface AddBirthdayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (birthday: Omit<Birthday, 'id'> & { id?: string }) => void;
  birthdayToEdit?: Birthday | null;
}

export default function AddBirthdayModal({ isOpen, onClose, onSave, birthdayToEdit }: AddBirthdayModalProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [errors, setErrors] = useState<{ name?: string; date?: string }>({});

  useEffect(() => {
    if (birthdayToEdit) {
      setName(birthdayToEdit.name);
      setDate(birthdayToEdit.date);
    } else {
      setName('');
      setDate('');
    }
    setErrors({});
  }, [birthdayToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; date?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre es obligatorio.';
    } else if (name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres.';
    }

    if (!date) {
      newErrors.date = 'La fecha de nacimiento es obligatoria.';
    } else {
      const birthDate = new Date(date);
      const today = new Date();
      if (birthDate > today) {
        newErrors.date = 'La fecha no puede ser en el futuro.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      id: birthdayToEdit?.id,
      name: name.trim(),
      date
    });
    onClose();
  };

  return (
    <div id="add-birthday-modal-overlay" className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        id="add-birthday-modal-container"
        className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/20 transform transition-all duration-300 relative border border-slate-100"
      >
        {/* Header */}
        <div className="flex justify-between items-center bg-slate-50/50 px-6 py-4.5 border-b border-slate-105">
          <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider">
            {birthdayToEdit ? 'EDITAR CUMPLEAÑOS' : 'AÑADIR CUMPLEAÑOS'}
          </h3>
          <button 
            id="modal-close-btn"
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-405 hover:text-slate-800 hover:bg-slate-100/60 transition-colors focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Nombre Completo
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                id="input-birthday-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                }}
                placeholder="EJ. ALBERTO SANTANDER"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-slate-800 text-xs font-bold uppercase placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-4 transition-all duration-200 ${
                  errors.name 
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10' 
                    : 'border-slate-150 focus:border-indigo-900 focus:ring-indigo-900/5'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-rose-600 text-[10px] font-bold uppercase tracking-tight">{errors.name}</p>
            )}
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Fecha de Nacimiento
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </span>
              <input
                id="input-birthday-date"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (errors.date) setErrors(prev => ({ ...prev, date: undefined }));
                }}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-slate-800 text-xs font-mono focus:outline-none focus:bg-white focus:ring-4 transition-all duration-200 ${
                  errors.date 
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10' 
                    : 'border-slate-150 focus:border-indigo-900 focus:ring-indigo-900/5'
                }`}
              />
            </div>
            {errors.date && (
              <p className="text-rose-600 text-[10px] font-bold uppercase tracking-tight">{errors.date}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex gap-3">
            <button
              id="modal-cancel-btn"
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl hover:text-slate-900 text-slate-500 font-semibold text-xs uppercase tracking-wider transition-all border border-slate-150"
            >
              Cancelar
            </button>
            <button
              id="modal-submit-btn"
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-900 text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-all hover:bg-indigo-950 active:scale-95 shadow-md shadow-indigo-950/15 border border-indigo-950/10"
            >
              <Save className="w-4 h-4" />
              {birthdayToEdit ? 'Guardar Cambios' : 'Añadir Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
