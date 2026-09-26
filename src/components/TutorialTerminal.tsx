import React, { useState } from 'react';
import { Monitor, Terminal, FolderOpen, ArrowRight, CheckCircle2, Copy, ChevronRight, HelpCircle } from 'lucide-react';

const TutorialTerminal: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeOS, setActiveOS] = useState<'windows' | 'mac' | 'linux'>('windows');
  const [currentStep, setCurrentStep] = useState(0);

  const copyCommand = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: 'Abrir la Terminal',
      description: 'La terminal es el programa donde vas a escribir los comandos. Es como un "chat" con tu computadora.',
    },
    {
      title: 'Ir a la carpeta del proyecto',
      description: 'Necesitás "entrar" a la carpeta donde están los archivos del proyecto usando el comando cd.',
    },
    {
      title: 'Instalar dependencias',
      description: 'El comando npm install descarga todas las herramientas que necesita el proyecto para funcionar.',
    },
    {
      title: 'Iniciar el servidor',
      description: 'El comando npm run dev levanta el servidor de desarrollo y te da una dirección web para ver el sistema.',
    },
    {
      title: '¡Listo! Abrir el navegador',
      description: 'Abrís tu navegador (Chrome, Firefox, Edge) y entrás a http://localhost:5173 para ver el sistema.',
    },
  ];

  const TerminalWindow: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title = 'Terminal' }) => (
    <div className="rounded-xl overflow-hidden shadow-lg border border-gray-700 bg-gray-900">
      {/* Title bar */}
      <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-xs text-gray-400 ml-2 font-mono">{title}</span>
      </div>
      {/* Content */}
      <div className="p-4 font-mono text-sm text-green-400 min-h-[120px]">
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="w-8 h-8" />
          <h2 className="text-2xl font-bold">¿Dónde copio los comandos?</h2>
        </div>
        <p className="text-indigo-100">
          Guía paso a paso para ejecutar el sistema en tu computadora. No necesitás saber programar.
        </p>
      </div>

      {/* OS Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">¿Qué sistema operativo usás?</p>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveOS('windows')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
              activeOS === 'windows' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🪟 Windows
          </button>
          <button
            onClick={() => setActiveOS('mac')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
              activeOS === 'mac' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🍎 macOS
          </button>
          <button
            onClick={() => setActiveOS('linux')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
              activeOS === 'linux' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🐧 Linux
          </button>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className={`bg-white rounded-xl border-2 transition-all ${
            currentStep === index ? 'border-blue-500 shadow-md' : 'border-gray-200'
          }`}>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  currentStep > index ? 'bg-green-500' : currentStep === index ? 'bg-blue-600' : 'bg-gray-300'
                }`}>
                  {currentStep > index ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              </div>

              {/* Step content */}
              {index === 0 && (
                <div className="ml-13 space-y-3">
                  {activeOS === 'windows' && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm font-medium text-blue-800 mb-2">Cómo abrir la terminal en Windows:</p>
                      <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                        <li>Presioná la tecla <kbd className="bg-blue-200 px-1.5 py-0.5 rounded text-xs font-mono">Windows</kbd></li>
                        <li>Escribí <strong>"PowerShell"</strong> o <strong>"CMD"</strong></li>
                        <li>Hacé click en <strong>"Windows PowerShell"</strong> o <strong>"Símbolo del sistema"</strong></li>
                      </ol>
                      <div className="mt-3 p-2 bg-blue-100 rounded">
                        <p className="text-xs text-blue-600">💡 <strong>Tip:</strong> También podés usar "Windows Terminal" si lo tenés instalado (es más moderno).</p>
                      </div>
                    </div>
                  )}
                  {activeOS === 'mac' && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm font-medium text-blue-800 mb-2">Cómo abrir la terminal en macOS:</p>
                      <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                        <li>Presioná <kbd className="bg-blue-200 px-1.5 py-0.5 rounded text-xs font-mono">⌘ Command</kbd> + <kbd className="bg-blue-200 px-1.5 py-0.5 rounded text-xs font-mono">Espacio</kbd></li>
                        <li>Escribí <strong>"Terminal"</strong></li>
                        <li>Presioná <kbd className="bg-blue-200 px-1.5 py-0.5 rounded text-xs font-mono">Enter</kbd></li>
                      </ol>
                    </div>
                  )}
                  {activeOS === 'linux' && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm font-medium text-blue-800 mb-2">Cómo abrir la terminal en Linux:</p>
                      <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                        <li>Presioná <kbd className="bg-blue-200 px-1.5 py-0.5 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-blue-200 px-1.5 py-0.5 rounded text-xs font-mono">Alt</kbd> + <kbd className="bg-blue-200 px-1.5 py-0.5 rounded text-xs font-mono">T</kbd></li>
                        <li>O buscá "Terminal" en el menú de aplicaciones</li>
                      </ol>
                    </div>
                  )}
                  <TerminalWindow title={activeOS === 'windows' ? 'PowerShell' : 'Terminal'}>
                    <p className="text-gray-500"># Se abrirá una ventana como esta:</p>
                    <p>
                      {activeOS === 'windows' 
                        ? 'PS C:\\Users\\TuNombre>' 
                        : 'usuario@computadora:~$'}
                      <span className="animate-pulse">▊</span>
                    </p>
                  </TerminalWindow>
                </div>
              )}

              {index === 1 && (
                <div className="ml-13 space-y-3">
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <p className="text-sm font-medium text-amber-800 mb-2">📁 ¿Dónde está la carpeta del proyecto?</p>
                    <p className="text-sm text-amber-700">
                      La carpeta del proyecto es donde descargaste/guardaste los archivos. Por ejemplo:
                    </p>
                    <ul className="text-sm text-amber-700 mt-2 space-y-1 list-disc list-inside">
                      <li><code className="bg-amber-100 px-1 rounded">C:\Users\TuNombre\Desktop\donnet-toners</code></li>
                      <li><code className="bg-amber-100 px-1 rounded">/home/usuario/proyectos/donnet-toners</code></li>
                      <li><code className="bg-amber-100 px-1 rounded">/Users/tu_nombre/Downloads/donnet-toners</code></li>
                    </ul>
                  </div>
                  <TerminalWindow title={activeOS === 'windows' ? 'PowerShell' : 'Terminal'}>
                    <p className="text-gray-500"># Escribí cd seguido de la ruta a tu carpeta:</p>
                    <p>
                      <span className="text-blue-400">cd</span>{' '}
                      {activeOS === 'windows'
                        ? 'C:\\Users\\TuNombre\\Desktop\\donnet-toners'
                        : '~/Desktop/donnet-toners'}
                    </p>
                    <p className="mt-2 text-gray-500"># También podés arrastrar la carpeta a la terminal</p>
                    <p className="text-gray-500"># y se escribirá la ruta automáticamente</p>
                    <p className="mt-2">
                      {activeOS === 'windows' 
                        ? 'PS C:\\Users\\TuNombre\\Desktop\\donnet-toners>'
                        : 'usuario@computadora:~/Desktop/donnet-toners$'}
                      <span className="animate-pulse">▊</span>
                    </p>
                  </TerminalWindow>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p className="text-sm text-green-700">
                      💡 <strong>Truco:</strong> En la mayoría de los sistemas, podés hacer click derecho sobre la carpeta y seleccionar "Abrir en Terminal" para ir directamente.
                    </p>
                  </div>
                </div>
              )}

              {index === 2 && (
                <div className="ml-13 space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-medium text-gray-800 mb-2">📦 ¿Qué hace npm install?</p>
                    <p className="text-sm text-gray-600">
                      Descarga todas las "herramientas" (librerías) que necesita el proyecto. Es como instalar los ingredientes antes de cocinar. <strong>Solo se hace una vez.</strong>
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      ⏱️ Puede tardar 1-3 minutos dependiendo de tu conexión a internet.
                    </p>
                  </div>
                  <TerminalWindow title={activeOS === 'windows' ? 'PowerShell' : 'Terminal'}>
                    <p className="text-gray-500"># Escribí este comando y presioná Enter:</p>
                    <p>
                      <span className="text-blue-400">npm</span> <span className="text-yellow-400">install</span>
                    </p>
                    <p className="mt-2 text-gray-500"># Vas a ver algo así:</p>
                    <p className="text-gray-400">added 287 packages in 12s</p>
                    <p className="text-gray-400">
                      <span className="text-green-400">✓</span> 1368 modules transformed.
                    </p>
                    <p className="mt-2">
                      {activeOS === 'windows' 
                        ? 'PS C:\\Users\\TuNombre\\Desktop\\donnet-toners>'
                        : 'usuario@computadora:~/Desktop/donnet-toners$'}
                      <span className="animate-pulse">▊</span>
                    </p>
                  </TerminalWindow>
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <p className="text-sm text-red-700">
                      ⚠️ <strong>Si da error:</strong> Necesitás instalar Node.js primero. Descargalo gratis desde{' '}
                      <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                        nodejs.org ↗
                      </a> (versión LTS)
                    </p>
                  </div>
                </div>
              )}

              {index === 3 && (
                <div className="ml-13 space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-medium text-gray-800 mb-2">🚀 ¿Qué hace npm run dev?</p>
                    <p className="text-sm text-gray-600">
                      Inicia un servidor local que te permite ver el sistema en tu navegador. <strong>Hay que dejar esta ventana abierta</strong> mientras uses el sistema.
                    </p>
                  </div>
                  <TerminalWindow title={activeOS === 'windows' ? 'PowerShell' : 'Terminal'}>
                    <p className="text-gray-500"># Escribí este comando y presioná Enter:</p>
                    <p>
                      <span className="text-blue-400">npm</span> <span className="text-blue-400">run</span> <span className="text-yellow-400">dev</span>
                    </p>
                    <p className="mt-2 text-gray-500"># Vas a ver algo así:</p>
                    <p className="text-gray-400">  VITE v6.4.3  ready in 320 ms</p>
                    <p className="mt-1">  <span className="text-green-400">➜</span>  Local:   <span className="text-cyan-400 underline">http://localhost:5173/</span></p>
                    <p>  <span className="text-green-400">➜</span>  Network: http://192.168.1.5:5173/</p>
                  </TerminalWindow>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p className="text-sm text-green-700">
                      ✅ <strong>¡Ya está!</strong> La dirección <code className="bg-green-100 px-1 rounded font-mono">http://localhost:5173</code> es donde vas a ver el sistema.
                    </p>
                  </div>
                </div>
              )}

              {index === 4 && (
                <div className="ml-13 space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600">
                      Abrí tu navegador favorito y escribí la dirección que apareció en la terminal.
                    </p>
                  </div>
                  
                  {/* Browser simulation */}
                  <div className="rounded-xl overflow-hidden shadow-lg border border-gray-300 bg-white">
                    <div className="bg-gray-100 px-4 py-2 flex items-center gap-3 border-b border-gray-200">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-600 font-mono border border-gray-200">
                        🔒 http://localhost:5173
                      </div>
                    </div>
                    <div className="p-8 bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center min-h-[200px]">
                      <div className="text-center text-white">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Monitor className="w-8 h-8" />
                        </div>
                        <p className="text-xl font-bold">Donnet S.A.</p>
                        <p className="text-blue-200 text-sm mt-1">Sistema de Gestión de Toners</p>
                        <p className="text-blue-300 text-xs mt-3">¡Ya podés loguearte!</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-sm text-blue-700">
                      🔑 <strong>Para entrar usá:</strong> admin@donnet.com.ar / admin123
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Anterior
                </button>
                <div className="flex gap-1">
                  {steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentStep(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        currentStep === i ? 'bg-blue-600 w-4' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  disabled={currentStep === steps.length - 1}
                  className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Reference */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-gray-600" />
          Resumen rápido de comandos
        </h3>
        <div className="space-y-2">
          {[
            { cmd: 'npm install', desc: 'Instalar dependencias (solo la primera vez)' },
            { cmd: 'npm run dev', desc: 'Iniciar el servidor de desarrollo' },
            { cmd: 'npm run build', desc: 'Generar versión para producción' },
            { cmd: 'Ctrl + C', desc: 'Detener el servidor (en la terminal)' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg group">
              <code className="bg-gray-900 text-green-400 px-3 py-1.5 rounded font-mono text-sm flex-shrink-0">
                {item.cmd}
              </code>
              <span className="text-sm text-gray-600 flex-1">{item.desc}</span>
              <button
                onClick={() => copyCommand(item.cmd, i + 100)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                title="Copiar"
              >
                <Copy className="w-4 h-4 text-gray-500" />
              </button>
              {copiedIndex === i + 100 && (
                <span className="text-xs text-green-600">¡Copiado!</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-3">❓ Preguntas frecuentes</h3>
        <div className="space-y-3">
          <div className="border-b border-gray-100 pb-3">
            <p className="text-sm font-medium text-gray-800">¿Necesito internet para usar el sistema?</p>
            <p className="text-sm text-gray-600 mt-1">Solo la primera vez para instalar las dependencias. Después funciona sin internet.</p>
          </div>
          <div className="border-b border-gray-100 pb-3">
            <p className="text-sm font-medium text-gray-800">¿Tengo que dejar la terminal abierta?</p>
            <p className="text-sm text-gray-600 mt-1">Sí, mientras uses el sistema la terminal tiene que estar abierta. Si la cerrás, se detiene el servidor.</p>
          </div>
          <div className="border-b border-gray-100 pb-3">
            <p className="text-sm font-medium text-gray-800">¿Pueden usarlo varias personas a la vez?</p>
            <p className="text-sm text-gray-600 mt-1">En modo desarrollo solo vos. Para que lo usen otros necesitás desplegarlo en un servidor (ver Guía de Implementación).</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">¿Qué pasa si cierro la computadora?</p>
            <p className="text-sm text-gray-600 mt-1">No pasa nada. Cuando la vuelvas a prender, solo tenés que abrir la terminal, ir a la carpeta y escribir <code className="bg-gray-100 px-1 rounded">npm run dev</code>.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialTerminal;
