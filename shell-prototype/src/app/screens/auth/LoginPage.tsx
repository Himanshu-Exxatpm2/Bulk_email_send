import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useSession } from '../../data/SessionContext';
import { postLoginPath } from '../../data/session';
import exxatSymbol from '../../../assets/login/exxat-symbol-logo.png';
import exxatWordmark from '../../../assets/login/ExxatOneLogo.svg';
import prismVisual from '../../../assets/login/ExxatPrismVisual.svg';

/**
 * /login — fidelity match to auth.exxat.com (new-exxat-theme).
 * Layout/copy/assets pulled from the live Keycloakify theme.
 */
export function LoginPage() {
  const { login, session } = useSession();
  const [email, setEmail] = useState(session.email);
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  // Not a real form submit: sandboxed viewers (no allow-forms) swallow submit events, so use click and Enter directly.
  const handleContinue = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!email.trim()) return;
    login();
    navigate(postLoginPath(session));
  };

  return (
    <div className="relative w-full min-h-screen bg-neutral-0 font-sans">
      {/* Absolute top wordmark (matches live header) */}
      <header className="h-14 bg-transparent lg:pointer-events-none lg:absolute lg:inset-x-0 lg:top-0 lg:z-30">
        <div className="mx-auto flex h-full w-full items-center px-4 sm:px-6">
          <img
            src={exxatWordmark}
            alt="Exxat"
            className="h-8 sm:h-10 lg:h-12 w-auto"
          />
        </div>
      </header>

      <div className="relative flex w-full flex-col overflow-auto lg:flex-row">
        {/* Form pane — right on desktop (44.53%) */}
        <section className="flex w-full flex-shrink-0 flex-col bg-neutral-0 lg:sticky lg:top-0 lg:h-screen lg:w-[44.53%] lg:overflow-y-auto">
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-6 sm:px-6 sm:py-8">
            <div className="w-full max-w-[340px] sm:max-w-[400px] md:max-w-[440px] lg:max-w-[480px]">
              {/* Symbol — shown on lg when no alert (live Template) */}
              <div className="hidden lg:flex justify-start pt-4 pb-4">
                <img
                  src={exxatSymbol}
                  alt="Exxat"
                  className="h-10 w-10 rounded-full object-cover"
                />
              </div>

              {/* Mobile symbol */}
              <div className="flex lg:hidden justify-center mb-4">
                <img
                  src={exxatSymbol}
                  alt="Exxat"
                  className="h-14 w-14 rounded-full object-cover"
                />
              </div>

              <div className="relative space-y-6 mt-4">
                <h1 className="text-2xl font-bold leading-tight text-neutral-900">
                  Access all your Exxat Applications
                </h1>

                <form onSubmit={handleContinue} onKeyDown={(e) => e.key === 'Enter' && handleContinue(e)} className="space-y-4" noValidate>
                  <div
                    className={`
                      flex flex-row items-center w-full rounded-md border relative
                      ${focused ? 'border-blue-500' : 'border-neutral-200 bg-neutral-50'}
                    `}
                  >
                    <Mail
                      className="ml-3 w-4 h-4 shrink-0 text-neutral-600"
                      aria-hidden
                    />
                    <input
                      type="text"
                      id="username"
                      name="username"
                      autoFocus
                      value={email}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your username or email"
                      className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-900 placeholder:text-neutral-500 py-3 px-3 min-h-11"
                      aria-label="Username or email"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={handleContinue}
                    className="w-full h-10 rounded-md bg-blue-500 hover:bg-blue-600 text-neutral-0 text-sm font-semibold shadow-none"
                  >
                    Continue
                  </Button>

                  <p className="text-xs text-neutral-600 leading-relaxed">
                    By continuing, you agree to our{' '}
                    <a
                      href="https://exxat.com/terms-of-use"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      Terms of Service
                    </a>{' '}
                    and that you have read and understood our{' '}
                    <a
                      href="https://exxat.com/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      Privacy Policy
                    </a>
                    .
                  </p>
                </form>

                <div className="h-px mt-4 w-2/3 mx-auto bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />

                <div className="space-y-3 pt-8">
                  <p className="text-sm font-medium text-neutral-850">
                    New student?{' '}
                    <a
                      href="https://one.exxat.com"
                      className="text-blue-500 font-medium hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join Exxat One Network
                    </a>
                  </p>
                  <p className="text-sm font-medium text-neutral-850">
                    New school or site?{' '}
                    <a
                      href="https://exxat.com/contact-us"
                      className="text-blue-500 font-medium hover:underline inline-flex items-center gap-1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Contact Sales
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Marketing pane — left on desktop (55.47%), order-first */}
        <section
          className="relative w-full flex-shrink-0 min-h-[20rem] overflow-visible sm:max-lg:max-w-[430px] sm:max-lg:self-center lg:order-first lg:w-[55.47%] lg:min-h-screen lg:overflow-hidden"
          style={{ containerType: 'size' }}
          aria-label="From Academics to Practice. Exxat connects the people and processes shaping tomorrow's workforce."
        >
          <div className="absolute inset-0 w-full h-full min-h-full bg-gradient-to-b from-pink-50 via-[#faf5ff] to-blue-100">
            <img
              src={prismVisual}
              alt=""
              className="absolute bottom-0 right-0 pointer-events-none select-none"
              style={{
                height: 'clamp(115%, 155cqh, 138%)',
                width: 'auto',
                objectFit: 'contain',
                objectPosition: 'right bottom',
              }}
            />
            <div
              className="relative flex h-full w-full flex-col items-start justify-start"
              style={{
                paddingLeft: 'clamp(1.5rem, 5cqw, 5rem)',
                paddingRight: 'clamp(1rem, 4cqw, 3rem)',
                transform: 'translateX(clamp(-1.5rem, 5cqw, 1rem))',
              }}
            >
              <div
                className="max-w-[85%] sm:max-w-[60%] lg:max-w-2xl"
                style={{ paddingTop: 'clamp(7rem, 6cqh, 9.5rem)' }}
              >
                <h2
                  className="font-serif text-slate-900 leading-none tracking-tight font-medium"
                  style={{
                    fontSize: 'clamp(1.15rem, 5.5cqw, 6.5rem)',
                    wordSpacing: 'clamp(0.15rem, 0.5cqw, 0.4rem)',
                  }}
                >
                  <span className="block">From</span>
                  <span className="block">Academics to</span>
                  <span className="block">Practice</span>
                </h2>
                <div
                  className="mt-[clamp(1.5rem,4cqh,2.5rem)]"
                  style={{
                    fontSize: 'clamp(0.75rem, 2.8cqw, 2.4rem)',
                    letterSpacing: '0.01em',
                  }}
                >
                  <p className="font-medium text-pink-500 leading-tight">
                    Exxat connects the
                  </p>
                  <p className="font-medium text-pink-500 leading-tight">
                    People and processes
                  </p>
                  <p className="font-medium text-pink-500 leading-tight">
                    shaping tomorrow&apos;s Workforce
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
