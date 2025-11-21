'use client' // Error components must be Client Components

import {
    AlertTriangle,
    ArrowLeft, Book,
    Database,
    FileQuestion,
    Home,
    RefreshCw,
    Search,
    Server,
    Wifi
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ProgramsError({ error, reset }: ErrorProps) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Programs Error:', error)
  }, [error])

  // Determine error type based on message or pathname
  const getErrorType = () => {
    const message = error.message.toLowerCase()
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'network'
    }
    if (message.includes('not found') || message.includes('404')) {
      return 'notfound'
    }
    if (message.includes('unauthorized') || message.includes('403')) {
      return 'unauthorized'
    }
    if (message.includes('database') || message.includes('supabase')) {
      return 'database'
    }
    return 'generic'
  }

  const errorType = getErrorType()

  // Get appropriate error content
  const getErrorContent = () => {
    switch (errorType) {
      case 'network':
        return {
          icon: <Wifi size={64} className="text-orange-400" />,
          title: 'Problém s pripojením',
          description: 'Nemôžeme sa pripojiť k serveru. Skontrolujte prosím svoje internetové pripojenie.',
          suggestion: 'Skúste obnoviť stránku alebo skontrolujte pripojenie k internetu.'
        }
      
      case 'notfound':
        return {
          icon: <FileQuestion size={64} className="text-blue-400" />,
          title: 'Obsah sa nenašiel',
          description: 'Program, kategória alebo lekcia, ktorú hľadáte, neexistuje alebo bola odstránená.',
          suggestion: 'Skúste vyhľadať podobný obsah alebo sa vráťte na hlavnú stránku programov.'
        }
      
      case 'unauthorized':
        return {
          icon: <AlertTriangle size={64} className="text-red-400" />,
          title: 'Prístup zamietnutý',
          description: 'Nemáte oprávnenie na prístup k tomuto obsahu.',
          suggestion: 'Prihláste sa alebo skontrolujte svoje oprávnenia.'
        }
      
      case 'database':
        return {
          icon: <Database size={64} className="text-purple-400" />,
          title: 'Problém s databázou',
          description: 'Vyskytol sa problém pri načítavaní údajov z našej databázy.',
          suggestion: 'Skúste to znovu o chvíľu. Ak problém pretrváva, kontaktujte podporu.'
        }
      
      default:
        return {
          icon: <Server size={64} className="text-gray-400" />,
          title: 'Niečo sa pokazilo',
          description: 'Vyskytla sa neočakávaná chyba pri načítavaní programov.',
          suggestion: 'Skúste obnoviť stránku alebo sa vráťte neskôr.'
        }
    }
  }

  const { icon, title, description, suggestion } = getErrorContent()

  // Get context-aware navigation
  const getNavigationOptions = () => {
    const pathSegments = pathname?.split('/').filter(Boolean) || []
    
    if (pathSegments.length === 1) {
      // /programs
      return [
        { href: '/', label: 'Domov', icon: <Home size={16} /> },
        { href: '/contact', label: 'Kontakt', icon: <Search size={16} /> }
      ]
    } else if (pathSegments.length === 2) {
      // /programs/[category]
      return [
        { href: '/programs', label: 'Všetky programy', icon: <Book size={16} /> },
        { href: '/', label: 'Domov', icon: <Home size={16} /> }
      ]
    } else if (pathSegments.length === 3) {
      // /programs/[category]/[programSlug]
      const category = pathSegments[1]
      return [
        { href: `/programs/${category}`, label: 'Späť na kategóriu', icon: <ArrowLeft size={16} /> },
        { href: '/programs', label: 'Všetky programy', icon: <Book size={16} /> },
        { href: '/', label: 'Domov', icon: <Home size={16} /> }
      ]
    } else {
      // /programs/[category]/[programSlug]/[sessionOrder]
      const category = pathSegments[1]
      const programSlug = pathSegments[2]
      return [
        { href: `/programs/${category}/${programSlug}`, label: 'Späť na program', icon: <ArrowLeft size={16} /> },
        { href: `/programs/${category}`, label: 'Kategória', icon: <Book size={16} /> },
        { href: '/programs', label: 'Všetky programy', icon: <Book size={16} /> }
      ]
    }
  }

  const navigationOptions = getNavigationOptions()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Error Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-12 text-center">
            <div className="flex justify-center mb-6">
              {icon}
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              {title}
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed">
              {description}
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {/* Suggestion */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <AlertTriangle size={20} />
                Čo môžete skúsiť:
              </h3>
              <p className="text-blue-800 leading-relaxed">
                {suggestion}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              {/* Primary Action */}
              <button
                onClick={reset}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                <RefreshCw size={20} />
                Skúsiť znovu
              </button>

              {/* Navigation Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {navigationOptions.map((option, index) => (
                  <Link key={index} href={option.href}>
                    <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors">
                      {option.icon}
                      {option.label}
                    </button>
                  </Link>
                ))}
              </div>
            </div>

            {/* Error Details (Development) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-8 p-4 bg-gray-50 rounded-lg border">
                <summary className="font-medium text-gray-700 cursor-pointer mb-2">
                  Technické detaily (Development)
                </summary>
                <div className="text-sm text-gray-600 space-y-2">
                  <div>
                    <strong>Chyba:</strong> {error.message}
                  </div>
                  <div>
                    <strong>Cesta:</strong> {pathname}
                  </div>
                  {error.digest && (
                    <div>
                      <strong>Digest:</strong> {error.digest}
                    </div>
                  )}
                  {error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Ak problém pretrváva, kontaktujte našu podporu.
              </div>
              <div className="flex items-center gap-4">
                <Link 
                  href="/contact" 
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Kontaktovať podporu
                </Link>
                <Link 
                  href="/faq" 
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Hľadáte niečo konkrétne?
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/programs/prayer">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-200 transition-colors text-sm">
                🙏 Modlitby
              </span>
            </Link>
            <Link href="/programs/meditation">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-200 transition-colors text-sm">
                🧘 Meditácie
              </span>
            </Link>
            <Link href="/programs/bible_study">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-200 transition-colors text-sm">
                📖 Biblické štúdium
              </span>
            </Link>
            <Link href="/programs/sleep_stories">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-200 transition-colors text-sm">
                🌙 Usínanie
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}