'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, Settings, Search, Truck, Globe } from 'lucide-react'
import { toast } from 'sonner'

interface SettingItem {
  id: string
  key: string
  value: string | null
  type: string
  group: string
}

const groupLabels: Record<string, { label: string; icon: React.ElementType }> = {
  general: { label: 'Genel', icon: Settings },
  seo: { label: 'SEO', icon: Search },
  shipping: { label: 'Kargo', icon: Truck },
  email: { label: 'E-posta', icon: Globe },
  payment: { label: 'Ödeme', icon: Settings },
}

export default function SettingsTab() {
  const [settings, setSettings] = useState<SettingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeGroup, setActiveGroup] = useState('general')
  const [editedValues, setEditedValues] = useState<Record<string, string>>({})

  const fetchSettings = useCallback(() => {
    setLoading(true)
    fetch('/api/settings?flat=true')
      .then(r => r.json())
      .then(d => {
        const arr = Array.isArray(d) ? d : []
        setSettings(arr)
        const vals: Record<string, string> = {}
        arr.forEach((s: SettingItem) => { vals[s.id] = s.value || '' })
        setEditedValues(vals)
      })
      .catch(() => toast.error('Ayarlar yüklenemedi'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const groups = [...new Set(settings.map(s => s.group))]
  const filtered = settings.filter(s => s.group === activeGroup)

  const handleSave = async () => {
    setSaving(true)
    try {
      const updates = filtered.map(s => ({
        id: s.id,
        key: s.key,
        value: editedValues[s.id] ?? s.value ?? '',
        type: s.type,
        group: s.group,
      }))
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      toast.success('Ayarlar kaydedildi')
      fetchSettings()
    } catch { toast.error('Kaydetme başarısız') }
    finally { setSaving(false) }
  }

  const renderInput = (setting: SettingItem) => {
    const value = editedValues[setting.id] ?? setting.value ?? ''
    if (setting.type === 'textarea') {
      return (
        <textarea
          className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={value}
          onChange={e => setEditedValues(v => ({ ...v, [setting.id]: e.target.value }))}
        />
      )
    }
    if (setting.type === 'number') {
      return (
        <Input
          type="number"
          value={value}
          onChange={e => setEditedValues(v => ({ ...v, [setting.id]: e.target.value }))}
        />
      )
    }
    return (
      <Input
        value={value}
        onChange={e => setEditedValues(v => ({ ...v, [setting.id]: e.target.value }))}
      />
    )
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-full" /><Card><CardContent className="p-4"><Skeleton className="h-64" /></CardContent></Card></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Ayarlar</h3>
        <Button onClick={handleSave} disabled={saving} className="bg-[#F27A1A] hover:bg-[#e06d10]">
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>

      <Tabs value={activeGroup} onValueChange={setActiveGroup}>
        <TabsList className="flex-wrap h-auto gap-1 bg-white p-1 rounded-lg border">
          {groups.map(g => {
            const info = groupLabels[g] || { label: g, icon: Settings }
            const Icon = info.icon
            return (
              <TabsTrigger key={g} value={g} className="text-xs">
                <Icon className="w-3.5 h-3.5 mr-1" />
                {info.label}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {groups.map(g => (
          <TabsContent key={g} value={g}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{groupLabels[g]?.label || g} Ayarları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings.filter(s => s.group === g).map(s => (
                  <div key={s.id} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
                    <div>
                      <Label className="text-sm font-medium">{s.key}</Label>
                      <Badge variant="outline" className="text-[10px] ml-2">{s.type}</Badge>
                    </div>
                    <div className="sm:col-span-2">
                      {renderInput(s)}
                    </div>
                  </div>
                ))}
                {settings.filter(s => s.group === g).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Bu grupta ayar bulunmuyor</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
