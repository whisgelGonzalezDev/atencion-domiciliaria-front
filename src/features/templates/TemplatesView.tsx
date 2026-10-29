import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { requestingEntitiesApi, type RequestingEntity } from '@/core/api/requesting-entities.api'
import { EntityModal } from './EntityModal'
import { TemplateEditor } from './TemplateEditor'

type Tab = 'entities' | 'templates'

export function TemplatesView() {
  const [tab, setTab] = useState<Tab>('entities')
  const [entities, setEntities] = useState<RequestingEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RequestingEntity | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    requestingEntitiesApi.getAll()
      .then(setEntities)
      .catch(() => toast.error('No se pudieron cargar las entidades'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const openNew = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (e: RequestingEntity) => { setEditing(e); setModalOpen(true) }

  const toggleActive = async (entity: RequestingEntity) => {
    try {
      const updated = await requestingEntitiesApi.update(entity.id, { active: !entity.active })
      setEntities((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo cambiar el estado')
    }
  }

  const handleSaved = (saved: RequestingEntity) => {
    setEntities((prev) => {
      const next = prev.some((e) => e.id === saved.id) ? prev.map((e) => (e.id === saved.id ? saved : e)) : [...prev, saved]
      return next.sort((a, b) => a.name.localeCompare(b.name, 'es'))
    })
  }

  const tabCls = (active: boolean) => [
    'px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
    active
      ? 'border-sky-600 text-zinc-900 dark:text-white'
      : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100',
  ].join(' ')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Plantillas</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Cada entidad solicitante podrá tener su propio récipe e informes. Sin entidad se usa el formato por defecto.
        </p>
      </div>

      <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
        <button className={tabCls(tab === 'entities')} onClick={() => setTab('entities')}>Entidades</button>
        <button className={tabCls(tab === 'templates')} onClick={() => setTab('templates')}>Plantillas</button>
      </div>

      {tab === 'templates' ? (
        <TemplateEditor entities={entities} />
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{entities.length} entidades registradas</p>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-medium text-white transition-colors"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Plus size={13} /> Nueva entidad
            </button>
          </div>

          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-card">
            {loading ? (
              <div className="flex justify-center py-10">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
              </div>
            ) : entities.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                Aún no hay entidades. Agrega aseguradoras, empresas o convenios que solicitan servicios.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80">
                      {['Nombre', 'RIF', 'Estado', ''].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {entities.map((e) => (
                      <tr key={e.id} className={e.active ? '' : 'opacity-60'}>
                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{e.name}</td>
                        <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{e.rif ?? '—'}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => void toggleActive(e)}
                            className={[
                              'rounded-full px-2 py-0.5 text-xs font-medium',
                              e.active
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500',
                            ].join(' ')}
                            title={e.active ? 'Desactivar' : 'Activar'}
                          >
                            {e.active ? 'Activa' : 'Inactiva'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openEdit(e)}
                            aria-label={`Editar ${e.name}`}
                            className="p-1.5 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            <Pencil size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <EntityModal open={modalOpen} entity={editing} onClose={() => setModalOpen(false)} onSaved={handleSaved} />
    </div>
  )
}
