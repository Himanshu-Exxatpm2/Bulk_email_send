/**
 * Exxat-aligned member profile modal (site or school).
 * Refines early exploration 371:949 / 371:1052 into Exxat UI language.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { FontAwesomeIcon } from '../font-awesome-icon';
import type { ClinicalSiteRow, MemberSchoolRow } from '../../config/members';

type Profile =
  | { kind: 'site'; data: ClinicalSiteRow }
  | { kind: 'school'; data: MemberSchoolRow };

interface MemberProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile | null;
}

export function MemberProfileModal({
  open,
  onOpenChange,
  profile,
}: MemberProfileModalProps) {
  if (!profile) return null;
  const { data, kind } = profile;
  const isSite = kind === 'site';
  const site = isSite ? (data as ClinicalSiteRow) : null;
  const school = !isSite ? (data as MemberSchoolRow) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[min(720px,94vw)] overflow-y-auto rounded-xl border-[#e5e7eb] p-0 shadow-xl sm:max-w-[720px]">
        {/* Header band */}
        <div className="bg-[#3f51b5] px-6 py-5 text-white">
          <DialogHeader className="gap-2 text-left">
            <div className="flex items-start justify-between gap-3 pr-6">
              <div>
                <DialogTitle className="text-xl font-semibold text-white">
                  {data.name}
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-indigo-100">
                  {isSite ? site!.system : school!.type} · {data.location}
                </DialogDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  data.status === 'Active'
                    ? 'bg-emerald-400/20 text-emerald-50 ring-1 ring-emerald-300/40'
                    : 'bg-white/15 text-white ring-1 ring-white/25'
                }`}
              >
                {data.status}
              </span>
              {isSite && (
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white ring-1 ring-white/25">
                  {site!.type}
                </span>
              )}
              {!isSite && (
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white ring-1 ring-white/25">
                  {school!.disciplines}
                </span>
              )}
            </div>
          </DialogHeader>
        </div>

        <div className="space-y-5 px-6 py-5">
          {/* Contact */}
          <section>
            <h3 className="mb-2 text-xs font-bold tracking-wide text-[#6b7280] uppercase">
              Contact
            </h3>
            <ul className="grid gap-2 text-sm text-[#374151] sm:grid-cols-2">
              <ContactRow icon="mapPin" label={data.address} />
              <ContactRow icon="envelope" label={data.email} />
              <ContactRow icon="phone" label={data.phone} />
              <ContactRow icon="externalLink" label={data.website} />
            </ul>
          </section>

          {/* About */}
          <section>
            <h3 className="mb-2 text-xs font-bold tracking-wide text-[#6b7280] uppercase">
              About
            </h3>
            <p className="text-sm leading-relaxed text-[#374151]">{data.about}</p>
            {data.partners.length > 0 && (
              <div className="mt-3">
                <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-[#6b7280] uppercase">
                  {isSite ? 'Core partners' : 'Core partners with'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {data.partners.map((p) => (
                    <span
                      key={p}
                      className="rounded bg-[#eeeffa] px-2 py-1 text-xs font-medium text-[#3f51b5]"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Metrics */}
          <section>
            <h3 className="mb-3 text-xs font-bold tracking-wide text-[#6b7280] uppercase">
              Placement metrics — 2026-27
            </h3>
            {isSite && site && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <Metric value={site.metrics.totalPlacements} label="Total placements hosted" />
                  <Metric value={site.metrics.requestsReceived} label="Requests received" />
                  <Metric value={site.metrics.requestsApproved} label="Requests approved" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Metric small value={site.metrics.responseRate} label="Response rate" />
                  <Metric small value={site.metrics.waitlisted} label="Wait-listed" />
                  <Metric small value={site.metrics.avgApprTime} label="Avg. appr. time" />
                  <Metric small value={site.metrics.disciplines} label="Disciplines" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <StatusBox value={site.metrics.upcoming} label="Upcoming" />
                  <StatusBox value={site.metrics.ongoing} label="Ongoing" />
                  <StatusBox value={site.metrics.completed} label="Completed (YTD)" />
                </div>
              </>
            )}
            {!isSite && school && (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Metric value={school.metrics.requestsMade} label="Requests made" />
                  <Metric value={school.metrics.requestsApproved} label="Requests approved" />
                  <Metric value={school.metrics.approvalRate} label="Approval rate" />
                  <Metric value={school.metrics.avgApprTime} label="Avg. appr. time" />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <Metric small value={school.metrics.sequenceSlots} label="Sequence slots" />
                  <Metric small value={school.metrics.availabilityRate} label="Availability rate" />
                  <Metric small value={school.metrics.confirmationRate} label="Confirmation rate" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <StatusBox value={school.metrics.upcoming} label="Upcoming" />
                  <StatusBox value={school.metrics.ongoing} label="Ongoing" />
                  <StatusBox value={school.metrics.total} label="Total (all-time)" />
                </div>
              </>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ContactRow({
  icon,
  label,
}: {
  icon: 'mapPin' | 'envelope' | 'phone' | 'externalLink';
  label: string;
}) {
  return (
    <li className="flex items-start gap-2">
      <FontAwesomeIcon name={icon} className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#3f51b5]" />
      <span>{label}</span>
    </li>
  );
}

function Metric({
  value,
  label,
  small,
}: {
  value: string;
  label: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-3 py-2.5">
      <p className={`font-bold text-[#111827] ${small ? 'text-base' : 'text-xl'}`}>{value}</p>
      <p className="mt-0.5 text-[11px] text-[#6b7280]">{label}</p>
    </div>
  );
}

function StatusBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-3 text-center shadow-sm">
      <p className="text-lg font-bold text-[#3f51b5]">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium text-[#6b7280]">{label}</p>
    </div>
  );
}
