import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Modal } from '@/core/components/Modal'
import { Button } from '@/core/components/Button'
import { inputCls, labelCls } from '@/core/components/formStyles'
import { requestingEntitiesApi, type RequestingEntity } from '@/core/api/requesting-entities.api'

interface EntityModalProps {
  open: boolean
  entity: RequestingEntity | null
  onClose: () => void
  onSaved: (entity: RequestingEntity) => void
}

export function EntityModal({ open, entity, onClose, onSaved }: EntityModalProps) {
  const [name, setName] = useState('')
  const [rif, setRif] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(entity?.name ?? '')
    setRif(entity?.rif ?? '')
    setError('')
  }, [open, entity])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) {
      setError('El nombre es requerido')
      return
    }
    setSaving(true)
    try {
      const body = { name: name.trim(), rif: rif.trim() || null }
      const saved = entity
        ? await requestingEntitiesApi.update(entity.id, body)
        : await requestingEntitiesApi.create(body)
      toast.success(entity ? `${saved.name} actualizada` : `${saved.name} agregada`)
      onSaved(saved)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la entidad')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <Modal.Header onClose={onClose}>{entity ? 'Editar entidad' : 'Nueva entidad solicitante'}</Modal.Header>
        <Modal.Body>
          <div className="space-y-3">
            <label className="block space-y-1">
              <span className={labelCls}>Nombre</span>
              <input
                className={inputCls()}
                value={name}
                onChange={(e) => { setName(e.target.value); setError('') }}
                placeholder="Seguros Caracas"
                autoFocus
              />
            </label>
            <label className="block space-y-1">
              <span className={labelCls}>RIF <span className="font-normal text-zinc-400">(opcional)</span></span>
              <input className={inputCls()} value={rif} onChange={(e) => setRif(e.target.value)} placeholder="J-00000000-0" />
            </label>
            {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={saving}>{entity ? 'Guardar' : 'Agregar'}</Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}
