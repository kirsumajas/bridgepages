import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastContext = createContext({ toast: () => {} })

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (type, message, opts = {}) => {
      const id = ++idRef.current
      setToasts((list) => [...list, { id, type, message, link: opts.link }])
      const ttl = opts.ttl ?? (type === 'error' ? 6000 : 4000)
      setTimeout(() => remove(id), ttl)
      return id
    },
    [remove],
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} onClick={() => remove(t.id)}>
            <span className="toast-icon">
              {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : '●'}
            </span>
            <div className="toast-body">
              <span>{t.message}</span>
              {t.link && (
                <a href={t.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                  View ↗
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
