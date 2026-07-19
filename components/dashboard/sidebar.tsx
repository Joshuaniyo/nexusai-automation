'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { Zap, Globe, History, Settings, Sparkles, Crown, ChevronLeft, ChevronRight, LogOut, ExternalLink, Loader2, X, Share2, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCheckout } from '@/hooks/use-checkout';

const nav = [
  { href: '/dashboard', label: 'Generate', icon: Zap, exact: true },
  { href: '/dashboard/assets', label: 'Asset Manager', icon: Globe },
  { href: '/dashboard/social-integrations', label: 'Social Integrations', icon: Share2 },
  { href: '/dashboard/analytics', label: 'Site Analytics', icon: BarChart3 },
  { href: '/dashboard/history', label: 'Content History', icon: History },
];

export function Sidebar({ onNavigate, mobile = false, collapsed = false, onToggleCollapse }: { onNavigate?: () => void; mobile?: boolean; collapsed?: boolean; onToggleCollapse?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, tier, isPremium, signOut, loading } = useAuth();
  const { loading: checkoutLoading, startCheckout } = useCheckout();

  async function handleUpgrade() {
    if (isPremium) return;
    await startCheckout();
  }

  if (loading) {
    return (
      <aside className="flex h-full w-full flex-col border-r" style={{ borderColor: 'hsl(220,14%,16%)', backgroundColor: 'hsl(220,16%,9%)' }}>
        <div className="flex items-center justify-center h-full">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </aside>
    );
  }

  return (
    <aside className="relative flex h-full w-full flex-col border-r" style={{ borderColor: 'hsl(220,14%,16%)', backgroundColor: 'hsl(220,16%,9%)' }}>
      {!mobile && onToggleCollapse && <button type="button" onClick={onToggleCollapse} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="absolute -right-3 top-16 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 shadow-lg transition hover:border-cyan-400/40 hover:text-cyan-300">{collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}</button>}
      {/* Logo */}
      <div className="flex items-center border-b" style={{ borderColor: 'hsl(220,14%,16%)' }}>
      <Link href="/" onClick={onNavigate} title={collapsed ? 'NexusAI Automation' : undefined} className={cn('flex flex-1 items-center gap-3 py-4 hover:opacity-80 transition-opacity', collapsed ? 'justify-center px-2' : 'px-4')}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center glow-cyan" style={{ background: 'linear-gradient(135deg, hsl(199,89%,48%), hsl(217,91%,60%))' }}>
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        {!collapsed && <div>
          <p className="text-sm font-bold" style={{ color: 'hsl(210,20%,95%)' }}>NexusAI</p>
          <p className="text-[10px] uppercase tracking-widest" style={{ color: 'hsl(215,16%,47%)' }}>Automation</p>
        </div>}
      </Link>
      {mobile && <button onClick={onNavigate} className="mr-3 rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Close navigation"><X className="h-5 w-5" /></button>}
      </div>

      {/* Nav */}
      <nav className={cn('flex-1 py-4 space-y-1 overflow-y-auto', collapsed ? 'px-2' : 'px-3')}>
        {!collapsed && <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-3" style={{ color: 'hsl(215,16%,47%)' }}>Core</p>}
        {nav.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              title={collapsed ? label : undefined}
              aria-label={collapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                collapsed && 'justify-center px-2',
                active
                  ? 'border'
                  : 'hover:opacity-80'
              )}
              style={active
                ? { backgroundColor: 'hsla(199,89%,48%,0.1)', color: 'hsl(199,89%,65%)', borderColor: 'hsla(199,89%,48%,0.25)' }
                : { color: 'hsl(215,16%,60%)', backgroundColor: 'transparent', borderColor: 'transparent' }
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && label}
              {active && !collapsed && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
            </Link>
          );
        })}
        <div className="pt-4">
          {!collapsed && <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-3" style={{ color: 'hsl(215,16%,47%)' }}>Quick Links</p>}
          <Link
            href="/pricing"
            onClick={onNavigate}
            title={collapsed ? 'Pricing' : undefined}
            aria-label={collapsed ? 'Pricing' : undefined}
            className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity', collapsed && 'justify-center px-2')}
            style={{ color: 'hsl(215,16%,60%)' }}
          >
            <Crown className="w-4 h-4" />
            {!collapsed && <>Pricing<ExternalLink className="w-3 h-3 ml-auto opacity-50" /></>}
          </Link>
          <span title={collapsed ? 'Settings' : undefined} className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-default', collapsed && 'justify-center px-2')} style={{ color: 'hsl(215,16%,50%)' }}>
            <Settings className="w-4 h-4" /> {!collapsed && 'Settings'}
          </span>
        </div>
      </nav>

      {/* Tier & User */}
      <div className={cn('py-3 border-t space-y-3', collapsed ? 'px-2' : 'px-3')} style={{ borderColor: 'hsl(220,14%,16%)' }}>
        {collapsed ? (!isPremium && <button type="button" onClick={handleUpgrade} disabled={checkoutLoading} title="Upgrade to Premium" aria-label="Upgrade to Premium" className="flex h-9 w-full items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20">{checkoutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}</button>) : <div className="rounded-lg p-3 border" style={{ backgroundColor: 'hsl(220,14%,14%)', borderColor: 'hsl(220,14%,20%)' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(215,16%,47%)' }}>Plan</p>
            <Badge variant="outline" className={cn('text-[10px] h-4 px-1.5', isPremium ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-white/10 text-white/40')}>
              {isPremium ? 'Premium' : 'Free'}
            </Badge>
          </div>
          {!isPremium ? (
            <Button
              size="sm"
              onClick={handleUpgrade}
              disabled={checkoutLoading}
              className="w-full h-7 text-xs border-0 bg-orange-500 hover:bg-orange-600 text-white"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  <Crown className="w-3 h-3 mr-1.5" />
                  Upgrade to Premium
                </>
              )}
            </Button>
          ) : (
            <div className="text-xs text-center text-[hsl(215,16%,47%)] py-1">
              All features unlocked
            </div>
          )}
        </div>}

        {user && (
          <div className={cn('flex items-center gap-2.5 px-1', collapsed && 'flex-col')}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, hsl(199,89%,48%), hsl(217,91%,60%))' }}>
              <span className="text-[10px] font-bold text-white">{user.avatar}</span>
            </div>
            {!collapsed && <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate" style={{ color: 'hsl(210,20%,95%)' }}>{user.name}</p>
              <p className="text-[10px] truncate" style={{ color: 'hsl(215,16%,47%)' }}>{user.email}</p>
            </div>}
            <button
              onClick={signOut}
              className="p-1.5 rounded hover:bg-[hsl(220,14%,14%)] transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4 text-[hsl(215,16%,47%)]" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
