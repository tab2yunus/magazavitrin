'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { MessageSquare, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface QuestionItem {
  id: string
  storeId: string
  userId?: string
  question: string
  answer?: string
  isAnswered: boolean
  isActive: boolean
  createdAt: string
  user?: { name: string; email?: string }
  store?: { name: string }
}

export default function QuestionsTab() {
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [answerDialog, setAnswerDialog] = useState(false)
  const [selectedQ, setSelectedQ] = useState<QuestionItem | null>(null)
  const [answer, setAnswer] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchQuestions = useCallback(() => {
    setLoading(true)
    fetch('/api/store-questions')
      .then(r => r.json())
      .then(d => setQuestions(Array.isArray(d) ? d : []))
      .catch(() => toast.error('Sorular yüklenemedi'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchQuestions() }, [fetchQuestions])

  const openAnswer = (q: QuestionItem) => {
    setSelectedQ(q)
    setAnswer(q.answer || '')
    setAnswerDialog(true)
  }

  const handleAnswer = async () => {
    if (!selectedQ || !answer.trim()) { toast.error('Cevap boş olamaz'); return }
    setSaving(true)
    try {
      await fetch(`/api/store-questions/${selectedQ.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, isAnswered: true }),
      })
      toast.success('Cevap kaydedildi')
      setAnswerDialog(false)
      fetchQuestions()
    } catch { toast.error('Cevap kaydedilemedi') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu soruyu silmek istediğinize emin misiniz?')) return
    try {
      await fetch(`/api/store-questions/${id}`, { method: 'DELETE' })
      toast.success('Soru silindi')
      fetchQuestions()
    } catch { toast.error('Silme başarısız') }
  }

  if (loading) {
    return <div className="space-y-4"><Card><CardContent className="p-4"><Skeleton className="h-64" /></CardContent></Card></div>
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Mağaza Soruları</h3>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mağaza</TableHead>
                  <TableHead>Soru</TableHead>
                  <TableHead>Cevap</TableHead>
                  <TableHead>Cevaplandı mı?</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map(q => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.store?.name || '-'}</TableCell>
                    <TableCell className="max-w-[250px]">
                      <div className="text-sm">{q.question}</div>
                      <div className="text-xs text-gray-400 mt-1">{q.user?.name || 'Anonim'}</div>
                    </TableCell>
                    <TableCell className="max-w-[200px] text-sm text-gray-600">
                      {q.answer || <span className="text-gray-400 italic">Cevaplanmadı</span>}
                    </TableCell>
                    <TableCell>
                      <Badge className={q.isAnswered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {q.isAnswered ? 'Evet' : 'Hayır'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{new Date(q.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openAnswer(q)} title="Cevapla">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(q.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {questions.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Soru bulunamadı</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Answer Dialog */}
      <Dialog open={answerDialog} onOpenChange={setAnswerDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Soruyu Cevapla</DialogTitle>
          </DialogHeader>
          {selectedQ && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">
                  {selectedQ.store?.name} - {selectedQ.user?.name || 'Anonim'}
                </div>
                <p className="text-sm font-medium">{selectedQ.question}</p>
              </div>
              <div className="space-y-2">
                <Label>Cevabınız</Label>
                <textarea
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Soruyu cevaplayın..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnswerDialog(false)}>İptal</Button>
            <Button onClick={handleAnswer} disabled={saving} className="bg-[#F27A1A] hover:bg-[#e06d10]">
              {saving ? 'Kaydediliyor...' : 'Cevapla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
