import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Loader2,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  MapPin,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();

  // Estados de carga y feedback
  const [isLoading, setIsLoading] = useState<
    "google" | "linkedin" | "email" | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Estados del formulario
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [location, setLocation] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(true);

  // Visibilidad de contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Cálculo de fortaleza de contraseña
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = [
    "Muy débil",
    "Débil",
    "Aceptable",
    "Fuerte",
    "Excelente",
  ];
  const strengthColors = [
    "bg-gray-200",
    "bg-red-500",
    "bg-amber-500",
    "bg-blue-500",
    "bg-emerald-500",
  ];

  // Manejador OAuth
  const handleOAuthRegister = (provider: "google" | "linkedin") => {
    setIsLoading(provider);
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
    window.location.href = `${backendUrl}/api/auth/${provider}`;
  };

  // Manejador Registro con Email
  const handleEmailRegister = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validaciones en cliente
    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (!acceptTerms) {
      setErrorMessage(
        "Debes aceptar los términos y condiciones para continuar.",
      );
      return;
    }

    setIsLoading("email");

    try {
      const backendUrl =
        import.meta.env.VITE_API_URL || "http://localhost:4000";

      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        location: location.trim() || "No especificada",
      };

      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Error al crear la cuenta. Intenta con otro correo.",
        );
      }

      setSuccessMessage("¡Cuenta creada exitosamente! Redirigiendo...");

      // Si el backend devuelve token directo (Auto-login)
      if (data.token) {
        localStorage.setItem("token", data.token);
        setTimeout(() => navigate("/dashboard"), 1200);
      } else {
        // Redirige al login si requiere iniciar sesión manualmente
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (error: any) {
      setErrorMessage(
        error.message || "Hubo un error de conexión con el servidor.",
      );
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans">
      {/* 🌟 SECCIÓN IZQUIERDA: Branding, Beneficios y Confianza */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 justify-between items-start flex-col p-16 text-white relative overflow-hidden">
        {/* Luces de fondo decorativas */}
        <div className="absolute top-[-15%] left-[-15%] w-[450px] h-[450px] bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-25 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>

        {/* Top: Logo & Badge */}
        <div className="z-10 w-full flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/30">
              T
            </div>
            <span className="text-2xl font-black tracking-tight">
              Talent-AI
            </span>
          </div>

          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Potenciado con IA
          </span>
        </div>

        {/* Middle: Propuesta de valor */}
        <div className="z-10 my-auto py-8">
          <h1 className="text-4xl xl:text-5xl font-extrabold mb-6 tracking-tight leading-tight">
            Impulsa tu carrera al{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              siguiente nivel
            </span>
            .
          </h1>
          <p className="text-lg text-slate-300 max-w-lg mb-10 leading-relaxed font-light">
            Crea tu cuenta en segundos y accede a herramientas de inteligencia
            artificial diseñadas para maximizar tus oportunidades de
            contratación.
          </p>

          {/* Lista de Beneficios */}
          <div className="space-y-4 max-w-md">
            <div className="flex items-start space-x-3.5">
              <div className="p-1 rounded-lg bg-blue-500/10 text-blue-400 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-100 text-sm">
                  Optimización de CV con IA
                </h4>
                <p className="text-xs text-slate-400">
                  Adapta tu currículum automáticamente a cada oferta laboral.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="p-1 rounded-lg bg-blue-500/10 text-blue-400 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-100 text-sm">
                  Tablero Kanban Inteligente
                </h4>
                <p className="text-xs text-slate-400">
                  Organiza todas tus postulaciones y entrevistas en tiempo real.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="p-1 rounded-lg bg-blue-500/10 text-blue-400 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-100 text-sm">
                  Emparejamiento de Empleos
                </h4>
                <p className="text-xs text-slate-400">
                  Filtra ofertas que realmente encajan con tus habilidades y
                  expectativas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Seguridad y confianza */}
        <div className="z-10 w-full flex items-center text-xs text-slate-400 space-x-2 border-t border-slate-800/80 pt-6">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>
            Tus datos están protegidos con encriptación de nivel bancario.
          </span>
        </div>
      </div>

      {/* ⚡ SECCIÓN DERECHA: Formulario de Registro */}
      <div className="flex w-full lg:w-1/2 justify-center items-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 sm:p-10 border border-slate-100">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Crea tu cuenta
            </h2>
            <p className="text-sm text-slate-500">
              Únete gratis y comienza a transformar tu búsqueda de empleo
            </p>
          </div>

          {/* Banner de Error */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center space-x-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Banner de Éxito */}
          {successMessage && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* BOTONES OAUTH */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {/* Google */}
            <button
              onClick={() => handleOAuthRegister("google")}
              disabled={isLoading !== null}
              type="button"
              className="flex items-center justify-center px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed font-medium text-xs sm:text-sm text-slate-700 shadow-sm"
            >
              {isLoading === "google" ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2 text-slate-600" />
              ) : (
                <svg className="w-4 h-4 mr-2 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              Google
            </button>

            {/* LinkedIn */}
            <button
              onClick={() => handleOAuthRegister("linkedin")}
              disabled={isLoading !== null}
              type="button"
              className="flex items-center justify-center px-4 py-3 bg-[#0A66C2] text-white rounded-xl hover:bg-[#004182] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed font-medium text-xs sm:text-sm shadow-sm"
            >
              {isLoading === "linkedin" ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2 text-white" />
              ) : (
                <svg
                  className="w-4 h-4 mr-2 fill-current flex-shrink-0"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0-.01-3.28 1.64 1.64 0 0 0 .01 3.28M7.86 18.5V10.13H5.07V18.5h2.79z" />
                </svg>
              )}
              LinkedIn
            </button>
          </div>

          {/* Divisor */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-400 font-medium uppercase tracking-wider">
                O completa tus datos
              </span>
            </div>
          </div>

          {/* FORMULARIO */}
          <form onSubmit={handleEmailRegister} className="space-y-4">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
                    placeholder="Juan"
                    disabled={isLoading !== null}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Apellido
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
                    placeholder="Pérez"
                    disabled={isLoading !== null}
                  />
                </div>
              </div>
            </div>

            {/* Correo Electrónico */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correo electrónico profesional
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
                  placeholder="juan.perez@empresa.com"
                  disabled={isLoading !== null}
                />
              </div>
            </div>

            {/* Ubicación (Opcional pero valorada para la BD) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Ubicación / Ciudad
                </label>
                <span className="text-[11px] text-slate-400">Opcional</span>
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
                  placeholder="Madrid, España / Remoto"
                  disabled={isLoading !== null}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
                  placeholder="Mínimo 6 caracteres"
                  disabled={isLoading !== null}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Barra de Fortaleza */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordStrength >= level
                            ? strengthColors[passwordStrength]
                            : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 flex justify-between">
                    <span>Seguridad:</span>
                    <span className="font-semibold text-slate-700">
                      {strengthLabels[passwordStrength]}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400 ${
                    confirmPassword && confirmPassword !== password
                      ? "border-red-400 focus:ring-red-400"
                      : "border-slate-200 focus:ring-slate-900"
                  }`}
                  placeholder="Repite tu contraseña"
                  disabled={isLoading !== null}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-[11px] text-red-500 mt-1">
                  Las contraseñas no coinciden.
                </p>
              )}
            </div>

            {/* Checkbox Términos */}
            <div className="flex items-start space-x-2 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <label
                htmlFor="terms"
                className="text-xs text-slate-500 leading-tight"
              >
                Acepto los{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Términos de servicio
                </a>{" "}
                y la{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Política de privacidad
                </a>
                .
              </label>
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={isLoading !== null}
              className="flex items-center justify-center w-full px-4 py-3.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed font-semibold text-sm shadow-md shadow-slate-900/10 hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.99] mt-2"
            >
              {isLoading === "email" ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2 text-white" />
              ) : null}
              Crear cuenta gratis
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center">
            <span className="text-xs text-slate-500">
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/login"
                className="text-blue-600 font-semibold hover:underline"
              >
                Inicia sesión aquí
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
