'use client'

import React, { useState } from 'react'
import {
  LayoutDashboard,
  Store,
  Package,
  FolderTree,
  Award,
  ShoppingCart,
  Users,
  Image,
  Megaphone,
  Ticket,
  Star,
  HelpCircle,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  Database,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import DashboardTab from './dashboard-tab'
import StoresTab from './stores-tab'
import ProductsTab from './products-tab'
import CategoriesTab from './categories-tab'
import BrandsTab from './brands-tab'
import OrdersTab from './orders-tab'
import CustomersTab from './customers-tab'
import BannersTab from './banners-tab'
import CampaignsTab from './campaigns-tab'
import CouponsTab from './coupons-tab'
import ReviewsTab from './reviews-tab'
import QuestionsTab from './questions-tab'
import SettingsTab from './settings-tab'
import ScraperTab from './scraper-tab'

interface AdminPanelProps {
  onBack: () => void
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'stores', label: 'Mağazalar', icon: Store },
  { id: 'products', label: 'Ürünler', icon: Package },
  { id: 'categories', label: 'Kategoriler', icon: FolderTree },
  { id: 'brands', label: 'Markalar', icon: Award },
  { id: 'orders', label: 'Siparişler', icon: ShoppingCart },
  { id: 'customers', label: 'Müşteriler', icon: Users },
  { id: 'banners', label: 'Bannerlar', icon: Image },
  { id: 'campaigns', label: 'Kampanyalar', icon: Megaphone },
  { id: 'coupons', label: 'Kuponlar', icon: Ticket },
  { id: 'reviews', label: 'Yorumlar', icon: Star },
  { id: 'questions', label: 'Sorular', icon: HelpCircle },
  { id: 'settings', label: 'Ayarlar', icon: Settings },
  { id: 'scraper', label: 'MOTOLUX Scraper', icon: Database },
]

function SidebarContent({ activeTab, setActiveTab, onBack, onMobileClose }: { activeTab: string; setActiveTab: (id: string) => void; onBack: () => void; onMobileClose?: () => void }) {
  return (
    <div className="flex flex-col h-full bg-[#1A2744]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-[#F27A1A] flex items-center justify-center">
          <Store className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">MağazaVitrin</h1>
          <p className="text-white/50 text-xs">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  onMobileClose?.()
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#F27A1A] text-white shadow-lg shadow-[#F27A1A]/25'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={onBack}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Mağazaya Dön</span>
        </button>
      </div>
    </div>
  )
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSetActive = (id: string) => {
    setActiveTab(id)
  }

  const handleBack = () => {
    onBack()
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />
      case 'stores': return <StoresTab />
      case 'products': return <ProductsTab />
      case 'categories': return <CategoriesTab />
      case 'brands': return <BrandsTab />
      case 'orders': return <OrdersTab />
      case 'customers': return <CustomersTab />
      case 'banners': return <BannersTab />
      case 'campaigns': return <CampaignsTab />
      case 'coupons': return <CouponsTab />
      case 'reviews': return <ReviewsTab />
      case 'questions': return <QuestionsTab />
      case 'settings': return <SettingsTab />
      case 'scraper': return <ScraperTab />
      default: return <DashboardTab />
    }
  }

  const currentMenu = menuItems.find(m => m.id === activeTab)

  return (
    <div className="flex h-screen bg-[#F5F5F5] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0">
        <SidebarContent
          activeTab={activeTab}
          setActiveTab={handleSetActive}
          onBack={handleBack}
        />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64" onCloseAutoFocus={() => setMobileOpen(false)}>
                <SheetTitle className="sr-only">Navigasyon Menüsü</SheetTitle>
                <SidebarContent
                  activeTab={activeTab}
                  setActiveTab={(id) => {
                    handleSetActive(id)
                    setMobileOpen(false)
                  }}
                  onBack={() => {
                    handleBack()
                    setMobileOpen(false)
                  }}
                  onMobileClose={() => setMobileOpen(false)}
                />
              </SheetContent>
            </Sheet>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {currentMenu?.label || 'Dashboard'}
              </h2>
              <p className="text-xs text-gray-500 hidden sm:block">MağazaVitrin Admin Paneli</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <div className="w-8 h-8 rounded-full bg-[#1A2744] flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
              <span className="font-medium">Admin</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="hidden sm:flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Mağazaya Dön
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
