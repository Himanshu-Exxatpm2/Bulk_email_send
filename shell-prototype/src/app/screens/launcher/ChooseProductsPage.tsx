import { useNavigate } from 'react-router';
import { FontAwesomeIcon } from '../../components/font-awesome-icon';
import { ExxatOneLogo } from '../../components/ExxatOneLogo';
import { useSession } from '../../data/SessionContext';
import {
  canAccessSchoolLayer,
  canAccessSiteLayer,
  schoolEntryPath,
  siteEntryPath,
} from '../../data/session';
import marketingPanel from '../../../assets/choose-products/marketing-panel.png';
import iconSchool from '../../../assets/choose-products/icon-school.svg';
import iconSite from '../../../assets/choose-products/icon-site.svg';

/**
 * "Choose a product to continue" — super-admin entry gate (Figma 263:2915).
 * Left: decorative marketing carousel. Right: Exxat One product picker.
 */
export function ChooseProductsPage() {
  const navigate = useNavigate();
  const { session, logout } = useSession();
  const showSchool = canAccessSchoolLayer(session);
  const showSite = canAccessSiteLayer(session);

  return (
    <div className="flex min-h-screen w-full bg-neutral-0">
      {/* Marketing carousel (decorative) */}
      <div className="relative hidden lg:block lg:w-[45%] xl:w-[48%] shrink-0 overflow-hidden">
        <img src={marketingPanel} alt="" aria-hidden className="h-full w-full object-cover object-left" />
      </div>

      {/* Product picker */}
      <div className="relative flex flex-1 flex-col px-6 py-6 sm:px-10">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-neutral-200 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
          >
            <FontAwesomeIcon name="signOut" className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center">
          <ExxatOneLogo variant="mark" className="mb-6" />
          <h1 className="text-2xl font-bold text-neutral-900">Choose a product to continue</h1>

          <p className="mt-4 flex items-center gap-2 text-sm text-neutral-700">
            <FontAwesomeIcon name="envelope" className="w-4 h-4 text-neutral-500" />
            {session.email}
          </p>

          <div className="mt-4 rounded-xl border border-neutral-200 p-5 shadow-sm">
            <div className="mb-1 flex items-baseline gap-1">
              <span className="text-[15px] font-bold text-neutral-900">Exxat</span>
              <span className="text-[15px] font-bold text-brand-magenta">One</span>
            </div>
            <p className="text-xs text-neutral-600">Select how you'd like to continue</p>

            <div className="mt-4 grid grid-cols-2 gap-4">
              {showSchool && (
                <ProductChoice
                  icon={iconSchool}
                  label="As School"
                  onClick={() => navigate(schoolEntryPath(session))}
                />
              )}
              {showSite && (
                <ProductChoice
                  icon={iconSite}
                  label="As Site"
                  onClick={() => navigate(siteEntryPath(session))}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductChoice({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center rounded-lg border border-neutral-200 px-4 py-5 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/40"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-neutral-50 group-hover:bg-neutral-0">
        <img src={icon} alt="" aria-hidden className="h-6 w-6 object-contain" />
      </span>
      <span className="mt-3 text-sm font-bold text-neutral-900">{label}</span>
      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-500">
        Continue
        <FontAwesomeIcon name="arrowRight" className="w-3 h-3" />
      </span>
    </button>
  );
}
