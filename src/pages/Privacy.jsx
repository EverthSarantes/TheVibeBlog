import { Link } from "react-router-dom";
import { Shield, AlertTriangle, Database, Lock, Eye } from "lucide-react";

export default function Privacy() {
  return (
    <div className="container-page py-12 md:py-16 max-w-3xl">
      <p className="text-xs font-sans font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">
        Legal
      </p>
      <h1 className="font-display text-display-sm text-ink-900 dark:text-white mb-8">
        Política de Privacidad
      </h1>

      {/* AI Warning Banner */}
      <div className="mb-10 p-6 rounded-md border-2 border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-display text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
              ⚠️ Este sitio fue creado 100% por Inteligencia Artificial
            </h2>
            <p className="text-yellow-800 dark:text-yellow-200 font-serif leading-relaxed">
              VibeBlog fue desarrollado completamente por IA (vibecoding). <strong>Ningún ser humano ha revisado,
              auditado ni verificado el código fuente.</strong> Esto es parte de la gracia y el experimento de este blog.
              Sin embargo, esto significa que <strong>siempre existe el riesgo de vulnerabilidades de seguridad</strong>
              no detectadas. Si decides iniciar sesión, lo haces bajo tu propia responsabilidad y asumiendo ese riesgo.
            </p>
            <p className="text-yellow-800 dark:text-yellow-200 font-serif leading-relaxed mt-3">
              <strong>Solo inicia sesión si confías en la IA y aceptas los riesgos.</strong> Si no te sientes cómodo,
              puedes leer todos los artículos publicados sin necesidad de crear una cuenta.
            </p>
          </div>
        </div>
      </div>

      {/* Data collected */}
      <section className="mb-10">
        <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" /> Datos que almacenamos
        </h2>
        <p className="text-ink-700 dark:text-ink-300 font-serif leading-relaxed mb-4">
          Cuando inicias sesión con Google, almacenamos la siguiente información en Firebase Firestore:
        </p>
        <ul className="space-y-3 text-ink-700 dark:text-ink-300 font-serif">
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <span><strong>Nombre de usuario</strong> (de tu cuenta de Google)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <span><strong>Correo electrónico</strong> (de tu cuenta de Google)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <span><strong>Foto de perfil</strong> (de tu cuenta de Google o la que subas manualmente)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <span><strong>Rol</strong> (lector, escritor o administrador)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <span><strong>Biografía</strong> (opcional, si la añades)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <span><strong>Artículos, comentarios y likes</strong> que publiques</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <span><strong>Email del newsletter</strong> (solo si te suscribes voluntariamente)</span>
          </li>
        </ul>
      </section>

      {/* What could be exposed */}
      <section className="mb-10">
        <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5" /> Qué se podría filtrar en caso de vulnerabilidad
        </h2>
        <p className="text-ink-700 dark:text-ink-300 font-serif leading-relaxed mb-4">
          Si existiera una vulnerabilidad de seguridad en el código (algo posible dado que fue generado por IA
          sin revisión humana), los siguientes datos podrían verse comprometidos:
        </p>
        <ul className="space-y-3 text-ink-700 dark:text-ink-300 font-serif">
          <li className="flex items-start gap-2">
            <span className="text-red-500 font-bold">•</span>
            <span><strong>Tu correo electrónico</strong> y nombre de usuario</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 font-bold">•</span>
            <span><strong>Tu foto de perfil</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 font-bold">•</span>
            <span><strong>Tu biografía</strong> (si la añadiste)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 font-bold">•</span>
            <span><strong>Tu rol en la plataforma</strong> (lector, escritor, admin)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 font-bold">•</span>
            <span><strong>Los artículos y comentarios</strong> que hayas publicado (estos son públicos por diseño)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 font-bold">•</span>
            <span><strong>Tu email de newsletter</strong> (si te suscribiste)</span>
          </li>
        </ul>
        <p className="text-ink-700 dark:text-ink-300 font-serif leading-relaxed mt-4">
          <strong>No almacenamos contraseñas</strong> (la autenticación se delega a Google).
          No almacenamos datos de pago ni información financiera.
        </p>
      </section>

      {/* Security measures */}
      <section className="mb-10">
        <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" /> Medidas de seguridad implementadas
        </h2>
        <ul className="space-y-3 text-ink-700 dark:text-ink-300 font-serif">
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>Reglas de seguridad de Firestore que restringen acceso por rol</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>Sanitización de contenido HTML con DOMPurify</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>Content Security Policy (CSP) en los headers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>Rate limiting en comentarios y likes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>Validación de datos en las reglas de Firestore (tipos, tamaños, campos)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>Prevención de escalada de privilegios (usuarios no pueden cambiar su propio rol)</span>
          </li>
        </ul>
        <p className="text-ink-500 dark:text-ink-400 font-serif text-sm mt-4 italic">
          A pesar de estas medidas, el código no ha sido auditado por un humano.
          Siempre existe la posibilidad de vulnerabilidades no detectadas.
        </p>
      </section>

      {/* User rights */}
      <section className="mb-10">
        <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" /> Tus derechos
        </h2>
        <ul className="space-y-3 text-ink-700 dark:text-ink-300 font-serif">
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <span>Puedes editar o eliminar tu perfil en cualquier momento</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <span>Puedes eliminar tus artículos y comentarios</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <span>Si quieres que eliminemos todos tus datos, contacta al administrador</span>
          </li>
        </ul>
      </section>

      {/* Last updated */}
      <div className="pt-8 border-t border-ink-200 dark:border-ink-800 text-sm text-ink-500 dark:text-ink-400">
        <p>Última actualización: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}</p>
        <p className="mt-2">
          <Link to="/" className="text-accent hover:underline">Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}