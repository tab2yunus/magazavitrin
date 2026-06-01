'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, ChevronRight, ChevronDown, FolderTree } from 'lucide-react'
import { toast } from 'sonner'

interface CategoryItem {
  id: string
  name: string
  slug: string
  parentId?: string
  description?: string
  icon?: string
  sortOrder: number
  isActive: boolean
  seoTitle?: string
  seoDescription?: string
  parent?: CategoryItem
  children?: CategoryItem[]
  _count?: { products: number }
}

const defaultForm = {
  name: '', slug: '', parentId: '', description: '', icon: '',
  sortOrder: '0', isActive: true, seoTitle: '', seoDescription: '',
}

function CategoryTreeNode({ cat, allCategories, onEdit, onDelete, depth = 0 }: {
  cat: CategoryItem
  allCategories: CategoryItem[]
  onEdit: (c: CategoryItem) => void
  onDelete: (id: string) => void
  depth?: number
}) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = cat.children && cat.children.length > 0

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-lg group"
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
      >
        <button onClick={() => setExpanded(!expanded)} className="w-5 h-5 flex items-center justify-center">
          {hasChildren ? (expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />) : <span className="w-4" />}
        </button>
        <span className="text-lg">{cat.icon || '📁'}</span>
        <span className="font-medium text-sm flex-1">{cat.name}</span>
        <Badge variant="secondary" className="text-[10px]">{cat._count?.products || 0} ürün</Badge>
        <Badge className={cat.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {cat.isActive ? 'Aktif' : 'Pasif'}
        </Badge>
        <span className="text-xs text-gray-400">Sıra: {cat.sortOrder}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(cat)}><Pencil className="w-3 h-3" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onDelete(cat.id)}><Trash2 className="w-3 h-3" /></Button>
        </div>
      </div>
      {expanded && hasChildren && (
        <div>
          {cat.children!.map(child => (
            <CategoryTreeNode
              key={child.id}
              cat={child}
              allCategories={allCategories}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CategoriesTab() {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CategoryItem | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)

  const fetchCategories = useCallback(() => {
    setLoading(true)
    fetch('/api/categories?flat=true')
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d) ? d : []))
      .catch(() => toast.error('Kategoriler yüklenemedi'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const tree = categories.filter(c => !c.parentId)
  const flatParentOptions = categories.filter(c => !c.parentId)

  const openNew = () => { setEditing(null); setForm(defaultForm); setDialogOpen(true) }
  const openEdit = (cat: CategoryItem) => {
    setEditing(cat)
    setForm({
      name: cat.name, slug: cat.slug, parentId: cat.parentId || '',
      description: cat.description || '', icon: cat.icon || '',
      sortOrder: String(cat.sortOrder), isActive: cat.isActive,
      seoTitle: cat.seoTitle || '', seoDescription: cat.seoDescription || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Kategori adı zorunludur'); return }
    setSaving(true)
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ]+/g, '-').replace(/(^-|-$)/g, '')
      const body = { ...form, slug, sortOrder: parseInt(form.sortOrder) || 0, parentId: form.parentId || null }
      if (editing) {
        await fetch(`/api/categories/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        toast.success('Kategori güncellendi')
      } else {
        await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        toast.success('Kategori oluşturuldu')
      }
      setDialogOpen(false)
      fetchCategories()
    } catch { toast.error('Kayıt başarısız') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      toast.success('Kategori silindi')
      fetchCategories()
    } catch { toast.error('Silme başarısız') }
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-40" /><Card><CardContent className="p-4"><Skeleton className="h-64" /></CardContent></Card></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Kategoriler</h3>
        <Button onClick={openNew} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]">
          <Plus className="w-4 h-4 mr-2" /> Yeni Kategori
        </Button>
      </div>

      <Card>
        <CardContent className="p-2">
          {tree.length > 0 ? (
            tree.map(cat => (
              <CategoryTreeNode key={cat.id} cat={cat} allCategories={categories} onEdit={openEdit} onDelete={handleDelete} />
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              <FolderTree className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              Kategori bulunamadı
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Kategori Düzenle' : 'Yeni Kategori'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2"><Label>Kategori Adı *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label>Üst Kategori</Label>
              <Select value={form.parentId || 'none'} onValueChange={v => setForm(f => ({ ...f, parentId: v === 'none' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="Yok" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Yok (Ana Kategori)</SelectItem>
                  {flatParentOptions.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>İkon (Emoji)</Label><Input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="💻" /></div>
            <div className="space-y-2"><Label>Sıra</Label><Input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} /></div>
            <div className="flex items-center gap-3 pt-6"><Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} /><Label>{form.isActive ? 'Aktif' : 'Pasif'}</Label></div>
            <div className="sm:col-span-2 space-y-2"><Label>Açıklama</Label><textarea className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="space-y-2"><Label>SEO Başlık</Label><Input value={form.seoTitle} onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))} /></div>
            <div className="space-y-2"><Label>SEO Açıklama</Label><Input value={form.seoDescription} onChange={e => setForm(f => ({ ...f, seoDescription: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]">{saving ? 'Kaydediliyor...' : 'Kaydet'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
