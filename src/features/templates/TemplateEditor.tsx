import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/core/components/Button'
import { inputCls, labelCls } from '@/core/components/formStyles'
import { documentTemplatesApi, type StoredTemplate } from '@/core/api/document-templates.api'
import type { RequestingEntity } from '@/core/api/requesting-entities.api'
import { useSystemSettings } from '@/core/providers/SystemSettingsProvider'
import { BINDINGS } from '../requests/pdf/template/bindings'
import { DEFAULT_TEMPLATES } from '../requests/pdf/template/defaults'
import {
  DOC_TYPES, DOC_TYPE_LABEL,
  type DocType, type DocumentDefinition, type FieldWidth, type SectionBlock, type SignatureItem, type SignaturesBlock, type TemplateBlock, type TemplateField,
} from '../requests/pdf/template/types'
import {
  moveItem, newField, newSection, newSignatures, removeAt, replaceAt, validateTemplate, widthForSource,
} from './templateEdit'
import { SAMPLE_RECORD, SAMPLE_REQUEST } from './sampleData'

const WIDTH_LABEL: Record<FieldWidth, string> = { full: 'Ancho completo', half: 'Mitad (2 por fila)', third: 'Tercio (3 por fila)' }
const small = 'h-8 text-xs'
const selectCls = `${inputCls()} ${small} py-0`

const BINDING_GROUPS = Object.entries(BINDINGS).reduce<Record<string, [string, string][]>>((acc, [id, b]) => {
  ;(acc[b.group] ??= []).push([id, b.label])
  return acc
}, {})

type Origin = 'own' | 'inherited' | 'factory'

function resolveBase(stored: StoredTemplate[], entityId: string, docType: DocType): { definition: DocumentDefinition; origin: Origin } {
  const slot = (id: string | null) => stored.find((t) => t.docType === docType && t.requestingEntityId === id)
  const own = slot(entityId || null)
  if (own) return { definition: own.definition, origin: 'own' }
  const clinic = entityId ? slot(null) : undefined
  if (clinic) return { definition: clinic.definition, origin: 'inherited' }
  return { definition: DEFAULT_TEMPLATES[docType], origin: 'factory' }
}

const ORIGIN_TEXT: Record<Origin, (entity: boolean) => string> = {
  own: () => 'Plantilla personalizada guardada.',
  inherited: () => 'Hereda la plantilla general de la clínica. Al guardar se crea una propia para esta entidad.',
  factory: (entity) => (entity ? 'Usa el formato de fábrica. Al guardar se crea una plantilla propia para esta entidad.' : 'Usa el formato de fábrica. Al guardar se vuelve la plantilla general de la clínica.'),
}

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled}
      className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
    >
      {children}
    </button>
  )
}

function ListControls({ index, count, onMove, onRemove, what }: { index: number; count: number; onMove: (d: -1 | 1) => void; onRemove: () => void; what: string }) {
  return (
    <div className="flex shrink-0 items-center">
      <IconButton label={`Subir ${what}`} onClick={() => onMove(-1)} disabled={index === 0}><ArrowUp size={13} /></IconButton>
      <IconButton label={`Bajar ${what}`} onClick={() => onMove(1)} disabled={index === count - 1}><ArrowDown size={13} /></IconButton>
      <IconButton label={`Quitar ${what}`} onClick={onRemove}><Trash2 size={13} /></IconButton>
    </div>
  )
}

function FieldRow({ field, index, count, onChange, onMove, onRemove }: {
  field: TemplateField; index: number; count: number
  onChange: (f: TemplateField) => void; onMove: (d: -1 | 1) => void; onRemove: () => void
}) {
  return (
    <div className="rounded border border-zinc-200 dark:border-zinc-800 p-2 space-y-2">
      <div className="flex items-center gap-2">
        <input
          aria-label="Etiqueta del campo" value={field.label} className={`${inputCls()} ${small}`}
          onChange={(e) => onChange({ ...field, label: e.target.value })}
        />
        <ListControls index={index} count={count} onMove={onMove} onRemove={onRemove} what="campo" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select
          aria-label="Dato que muestra" value={field.source} className={selectCls}
          onChange={(e) => onChange({ ...field, source: e.target.value, width: widthForSource(e.target.value, field.width) })}
        >
          {Object.entries(BINDING_GROUPS).map(([group, items]) => (
            <optgroup key={group} label={group}>
              {items.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </optgroup>
          ))}
        </select>
        <select
          aria-label="Ancho" value={field.width} className={selectCls}
          onChange={(e) => onChange({ ...field, width: e.target.value as FieldWidth })}
        >
          {(Object.keys(WIDTH_LABEL) as FieldWidth[]).map((w) => (
            <option key={w} value={w} disabled={w !== 'full' && BINDINGS[field.source]?.kind === 'long'}>{WIDTH_LABEL[w]}</option>
          ))}
        </select>
      </div>
      {field.width === 'full' && (
        <input
          aria-label="Texto si está vacío" placeholder="Texto si está vacío (opcional)" value={field.placeholder ?? ''}
          className={`${inputCls()} ${small}`}
          onChange={(e) => onChange({ ...field, placeholder: e.target.value || undefined })}
        />
      )}
    </div>
  )
}

function SectionEditor({ block, index, count, onChange, onMove, onRemove }: {
  block: SectionBlock; index: number; count: number
  onChange: (b: SectionBlock) => void; onMove: (d: -1 | 1) => void; onRemove: () => void
}) {
  const setFields = (fields: TemplateField[]) => onChange({ ...block, fields })
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <input
          aria-label="Título de la sección" placeholder="Título de la sección (opcional)" value={block.title ?? ''}
          className={`${inputCls()} ${small} font-medium`}
          onChange={(e) => onChange({ ...block, title: e.target.value || undefined })}
        />
        <ListControls index={index} count={count} onMove={onMove} onRemove={onRemove} what="sección" />
      </div>
      {block.fields.map((field, fi) => (
        <FieldRow
          key={field.id} field={field} index={fi} count={block.fields.length}
          onChange={(f) => setFields(replaceAt(block.fields, fi, f))}
          onMove={(d) => setFields(moveItem(block.fields, fi, d))}
          onRemove={() => setFields(removeAt(block.fields, fi))}
        />
      ))}
      <Button type="button" size="sm" variant="ghost" onClick={() => setFields([...block.fields, newField()])}>
        <Plus size={12} /> Agregar campo
      </Button>
    </div>
  )
}

function SignaturesEditor({ block, index, count, onChange, onMove, onRemove }: {
  block: SignaturesBlock; index: number; count: number
  onChange: (b: SignaturesBlock) => void; onMove: (d: -1 | 1) => void; onRemove: () => void
}) {
  const setItems = (items: SignatureItem[]) => onChange({ ...block, items })
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Firmas</p>
        <ListControls index={index} count={count} onMove={onMove} onRemove={onRemove} what="bloque de firmas" />
      </div>
      {block.items.map((item, i) => (
        <div key={i} className="rounded border border-zinc-200 dark:border-zinc-800 p-2 space-y-2">
          <div className="flex items-center gap-2">
            <input
              aria-label="Texto bajo la firma" value={item.label} className={`${inputCls()} ${small}`}
              onChange={(e) => setItems(replaceAt(block.items, i, { ...item, label: e.target.value }))}
            />
            <IconButton label="Quitar firmante" onClick={() => setItems(removeAt(block.items, i))}><Trash2 size={13} /></IconButton>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              aria-label="Quién firma" value={item.who} className={`${selectCls} w-auto`}
              onChange={(e) => setItems(replaceAt(block.items, i, { ...item, who: e.target.value as SignatureItem['who'] }))}
            >
              <option value="doctor">Médico</option>
              <option value="affiliate">Paciente / afiliado</option>
            </select>
            <label className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox" checked={!!item.appendDoctorName}
                onChange={(e) => setItems(replaceAt(block.items, i, { ...item, appendDoctorName: e.target.checked }))}
              />
              Añadir nombre del médico
            </label>
          </div>
        </div>
      ))}
      <Button type="button" size="sm" variant="ghost" onClick={() => setItems([...block.items, { label: 'Firma', who: 'doctor' }])}>
        <Plus size={12} /> Agregar firmante
      </Button>
    </div>
  )
}

interface TemplateEditorProps {
  entities: RequestingEntity[]
}

export function TemplateEditor({ entities }: TemplateEditorProps) {
  const { settings } = useSystemSettings()
  const [stored, setStored] = useState<StoredTemplate[] | null>(null)
  const [entityId, setEntityId] = useState('')
  const [docType, setDocType] = useState<DocType>('recipe')
  const [working, setWorking] = useState<DocumentDefinition>(DEFAULT_TEMPLATES.recipe)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState(false)
  const urlRef = useRef<string | null>(null)

  useEffect(() => {
    documentTemplatesApi.getAll().then(setStored).catch(() => {
      toast.error('No se pudieron cargar las plantillas guardadas')
      setStored([])
    })
  }, [])

  const base = useMemo(() => (stored ? resolveBase(stored, entityId, docType) : null), [stored, entityId, docType])

  // New selection or fresh data from the server: start from what applies to this slot.
  useEffect(() => {
    if (!base) return
    setWorking(structuredClone(base.definition))
    setDirty(false)
  }, [base])

  const edit = useCallback((updater: (d: DocumentDefinition) => DocumentDefinition) => {
    setWorking((d) => updater(d))
    setDirty(true)
  }, [])

  // Live preview: debounced, with made-up data, never downloads anything.
  useEffect(() => {
    let cancelled = false
    const timer = window.setTimeout(async () => {
      try {
        const { buildDocument } = await import('../requests/pdf/template/render')
        const doc = await buildDocument(working, SAMPLE_REQUEST, SAMPLE_RECORD, settings)
        if (cancelled) return
        const url = doc.output('bloburl').toString()
        if (urlRef.current) URL.revokeObjectURL(urlRef.current)
        urlRef.current = url
        setPreviewUrl(url)
        setPreviewError(false)
      } catch {
        if (!cancelled) setPreviewError(true)
      }
    }, 500)
    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [working, settings])

  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current) }, [])

  const confirmDiscard = () => !dirty || window.confirm('Tienes cambios sin guardar en esta plantilla. ¿Descartarlos?')
  const changeEntity = (id: string) => { if (confirmDiscard()) setEntityId(id) }
  const changeDocType = (t: DocType) => { if (confirmDiscard()) setDocType(t) }

  const problem = validateTemplate(working)

  const save = async () => {
    setSaving(true)
    try {
      const saved = await documentTemplatesApi.save({ requestingEntityId: entityId || null, docType, definition: working })
      setStored((prev) => [...(prev ?? []).filter((t) => t.id !== saved.id), saved])
      toast.success('Plantilla guardada')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo guardar la plantilla')
    } finally {
      setSaving(false)
    }
  }

  const reset = async () => {
    if (base?.origin === 'own') {
      const message = entityId ? 'Se eliminará la plantilla de esta entidad y volverá a usar la general de la clínica o el formato de fábrica.' : 'Se eliminará la plantilla general y volverá el formato de fábrica.'
      if (!window.confirm(`${message} ¿Continuar?`)) return
      const own = stored?.find((t) => t.docType === docType && t.requestingEntityId === (entityId || null))
      if (!own) return
      try {
        await documentTemplatesApi.remove(own.id)
        setStored((prev) => (prev ?? []).filter((t) => t.id !== own.id))
        toast.success('Plantilla restablecida')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'No se pudo restablecer')
      }
    } else if (base) {
      setWorking(structuredClone(base.definition))
      setDirty(false)
    }
  }

  const setBlock = (i: number, block: TemplateBlock) => edit((d) => ({ ...d, blocks: replaceAt(d.blocks, i, block) }))

  if (!stored || !base) {
    return <div className="flex justify-center py-10"><span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" /></div>
  }

  const header = working.header
  const activeEntities = entities.filter((e) => e.active || e.id === entityId)

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className={labelCls}>Aplica a</span>
            <select className={selectCls} value={entityId} onChange={(e) => changeEntity(e.target.value)}>
              <option value="">Todas (plantilla general)</option>
              {activeEntities.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className={labelCls}>Documento</span>
            <select className={selectCls} value={docType} onChange={(e) => changeDocType(e.target.value as DocType)}>
              {DOC_TYPES.map((t) => <option key={t} value={t}>{DOC_TYPE_LABEL[t]}</option>)}
            </select>
          </label>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{ORIGIN_TEXT[base.origin](!!entityId)}</p>

        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Encabezado</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className={labelCls}>Título</span>
              <input className={`${inputCls()} ${small}`} value={header.title} onChange={(e) => edit((d) => ({ ...d, header: { ...d.header, title: e.target.value } }))} />
            </label>
            <label className="space-y-1">
              <span className={labelCls}>Subtítulo <span className="font-normal text-zinc-400">({'{id}'} caso, {'{date}'} fecha)</span></span>
              <input
                className={`${inputCls()} ${small}`} value={header.subtitle ?? ''}
                onChange={(e) => edit((d) => ({ ...d, header: { ...d.header, subtitle: e.target.value || undefined } }))}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-600 dark:text-zinc-400">
            <label className="inline-flex items-center gap-1.5">
              <input type="checkbox" checked={header.showLogo} onChange={(e) => edit((d) => ({ ...d, header: { ...d.header, showLogo: e.target.checked } }))} />
              Mostrar logo
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input type="checkbox" checked={header.showClinicName} onChange={(e) => edit((d) => ({ ...d, header: { ...d.header, showClinicName: e.target.checked } }))} />
              Mostrar nombre de la clínica
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input type="checkbox" checked={!!working.footer?.showDate} onChange={(e) => edit((d) => ({ ...d, footer: { showDate: e.target.checked } }))} />
              Fecha al pie
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox" checked={!!header.accent}
                onChange={(e) => edit((d) => ({ ...d, header: { ...d.header, accent: e.target.checked ? settings?.accent ?? '#2563eb' : undefined } }))}
              />
              Color propio
              {header.accent && (
                <input
                  type="color" aria-label="Color del documento" value={header.accent} className="h-6 w-8 cursor-pointer rounded border border-zinc-200"
                  onChange={(e) => edit((d) => ({ ...d, header: { ...d.header, accent: e.target.value } }))}
                />
              )}
            </label>
          </div>
        </div>

        {working.blocks.map((block, i) => {
          const common = {
            index: i, count: working.blocks.length,
            onMove: (delta: -1 | 1) => edit((d) => ({ ...d, blocks: moveItem(d.blocks, i, delta) })),
            onRemove: () => edit((d) => ({ ...d, blocks: removeAt(d.blocks, i) })),
          }
          return block.type === 'section'
            ? <SectionEditor key={block.id} block={block} onChange={(b) => setBlock(i, b)} {...common} />
            : <SignaturesEditor key={block.id} block={block} onChange={(b) => setBlock(i, b)} {...common} />
        })}

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={() => edit((d) => ({ ...d, blocks: [...d.blocks, newSection()] }))}>
            <Plus size={12} /> Agregar sección
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => edit((d) => ({ ...d, blocks: [...d.blocks, newSignatures()] }))}>
            <Plus size={12} /> Agregar firmas
          </Button>
        </div>

        <div className="sticky bottom-0 -mx-1 flex flex-wrap items-center gap-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/95 dark:bg-zinc-950/95 px-1 py-3 backdrop-blur">
          <Button type="button" onClick={() => void save()} loading={saving} disabled={!dirty || !!problem}>Guardar plantilla</Button>
          <Button type="button" variant="ghost" onClick={() => void reset()} disabled={base.origin !== 'own' && !dirty}>
            {base.origin === 'own' ? 'Restablecer al formato anterior' : 'Descartar cambios'}
          </Button>
          {problem ? <span className="text-xs text-red-600 dark:text-red-400">{problem}</span> : dirty && <span className="text-xs text-amber-600 dark:text-amber-400">Cambios sin guardar</span>}
        </div>
      </div>

      <div className="lg:sticky lg:top-4 lg:self-start">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Vista previa (datos de ejemplo)</p>
        <div className="aspect-[210/297] w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white">
          {previewUrl && !previewError
            ? <iframe title="Vista previa del documento" src={previewUrl} className="h-full w-full" />
            : <div className="flex h-full items-center justify-center p-6 text-center text-sm text-zinc-500">
                {previewError ? 'No se pudo dibujar la vista previa con esta plantilla.' : 'Generando vista previa…'}
              </div>}
        </div>
      </div>
    </div>
  )
}
