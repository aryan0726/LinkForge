import { useState } from "react";
import {
  FiAlertTriangle,
  FiCheck,
  FiInfo,
  FiLogOut,
  FiMail,
  FiRefreshCw,
  FiShield,
  FiUser,
} from "react-icons/fi";
import Card, { CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
import {
  avatarTone,
  formatDate,
  getInitials,
} from "../utils/format";

/**
 * Settings.
 *
 * Scope: the backend exposes GET /api/user/me for reading the profile and
 * POST /api/auth/** for authentication only. There is no profile-update,
 * password-change or account-deletion endpoint, so those forms are presented as
 * unavailable rather than as non-functional inputs. Logout is fully supported and
 * works locally by discarding the token.
 */
export default function Settings() {
  const { user, signOut, refreshUser } = useAuth();
  const toast = useToast();

  const [confirmLogout, setConfirmLogout] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const initials = getInitials(user?.fullName || user?.username, "U");
  const tone = avatarTone(user?.email || user?.username || "linkforge");

  const handleLogout = () => {
    setConfirmLogout(false);
    signOut({ redirect: true, message: "You've been logged out." });
    toast.info("Signed out", "Your session has been ended on this device.");
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
      toast.success("Profile refreshed", "Your account details are up to date.");
    } catch {
      toast.error("Couldn't refresh", "We couldn't reload your profile.");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* ---------------- Profile ---------------- */}
      <Card>
        <CardHeader
          title="Profile"
          subtitle="Your account details as stored by LinkForge."
          action={
            <Button
              variant="ghost"
              size="sm"
              icon={
                <FiRefreshCw
                  size={14}
                  className={refreshing ? "animate-spin" : ""}
                />
              }
              onClick={handleRefresh}
              disabled={refreshing}
            >
              Refresh
            </Button>
          }
        />

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
          <span
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} text-xl font-bold text-white shadow-lift`}
            aria-hidden="true"
          >
            {initials}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold tracking-tight text-ink-900">
              {user?.fullName || "—"}
            </p>
            <p className="mt-0.5 truncate text-[13.5px] text-ink-500">
              @{user?.username || "—"}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-ink-50 px-2.5 py-1 text-[11.5px] font-semibold text-ink-600">
                <FiShield size={12} />
                {user?.role === "ADMIN" ? "Administrator" : "Standard account"}
              </span>

              {user?.enabled ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11.5px] font-semibold text-emerald-700">
                  <FiCheck size={12} />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11.5px] font-semibold text-amber-700">
                  <FiAlertTriangle size={12} />
                  Disabled
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ---------------- Account information ---------------- */}
      <Card>
        <CardHeader
          title="Account information"
          subtitle="Read-only details from GET /api/user/me."
        />

        <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <Field
            icon={FiUser}
            label="Full name"
            value={user?.fullName || "—"}
          />
          <Field icon={FiUser} label="Username" value={user?.username || "—"} />
          <Field icon={FiMail} label="Email address" value={user?.email || "—"} />
          <Field
            icon={FiShield}
            label="Member since"
            value={formatDate(user?.createdAt)}
          />
        </dl>

        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-ink-200 bg-ink-50/60 p-3.5">
          <FiInfo
            className="mt-0.5 shrink-0 text-ink-400"
            size={15}
            aria-hidden="true"
          />
          <p className="text-[12.5px] leading-relaxed text-ink-500">
            Editing your name, username or email is not available yet — the API
            does not expose a profile-update endpoint. These fields are shown for
            reference only.
          </p>
        </div>
      </Card>

      {/* ---------------- Security ---------------- */}
      <Card>
        <CardHeader
          title="Security"
          subtitle="How your account is protected."
        />

        <div className="mt-6 space-y-4">
          <SecurityRow
            title="Authentication method"
            detail="JSON Web Token, verified on every protected request."
            available
          />
          <SecurityRow
            title="Password storage"
            detail="Hashed with BCrypt before being written to the database."
            available
          />
          <SecurityRow
            title="Session length"
            detail="Tokens are issued with a 24-hour expiry."
            available
          />
          <SecurityRow
            title="Change password"
            detail="Not available — the API has no password-update endpoint."
          />
        </div>
      </Card>

      {/* ---------------- Session ---------------- */}
      <Card>
        <CardHeader
          title="Session"
          subtitle="End your session on this device."
        />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-100 bg-red-50/50 p-5">
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-ink-900">Log out</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">
              Removes your token from this browser. Your links and click counts
              stay safe on the server.
            </p>
          </div>

          <Button
            variant="danger"
            icon={<FiLogOut size={15} />}
            onClick={() => setConfirmLogout(true)}
          >
            Log out
          </Button>
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-dashed border-ink-200 bg-ink-50/60 p-3.5">
          <FiInfo
            className="mt-0.5 shrink-0 text-ink-400"
            size={15}
            aria-hidden="true"
          />
          <p className="text-[12.5px] leading-relaxed text-ink-500">
            <span className="font-semibold text-ink-600">
              Account deletion is not available.
            </span>{" "}
            The API provides no endpoint for removing an account, so no delete
            control is shown here. This avoids presenting an action that could not
            be completed.
          </p>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={handleLogout}
        icon={FiLogOut}
        title="Log out of LinkForge?"
        message="You'll need to sign in again to manage your links. Nothing is deleted."
        confirmLabel="Log out"
      />
    </div>
  );
}

function Field({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-[0.1em] text-ink-400">
        <Icon size={12} aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1.5 truncate text-[14px] font-semibold text-ink-900">
        {value}
      </dd>
    </div>
  );
}

function SecurityRow({ title, detail, available = false }) {
  return (
    <div className="flex items-start gap-3.5 rounded-xl border border-ink-100 bg-white p-4">
      <span
        className={[
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          available
            ? "bg-emerald-50 text-emerald-600"
            : "bg-ink-100 text-ink-400",
        ].join(" ")}
      >
        {available ? (
          <FiCheck size={15} aria-hidden="true" />
        ) : (
          <FiAlertTriangle size={14} aria-hidden="true" />
        )}
      </span>

      <div className="min-w-0">
        <p className="text-[13.5px] font-bold text-ink-900">{title}</p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-500">
          {detail}
        </p>
      </div>
    </div>
  );
}
