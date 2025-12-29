import React from "react";
import { X } from "lucide-react";

const UserProfile = ({
  userObject,
  authUser,
  showProfile,
  setShowProfile,
}) => {
  if (!showProfile || !userObject || !authUser) return null;

  const {
    firstName,
    lastName,
    age,
    email,
    mobile,
    role,
    field = [],
    description,
    location,
    profilePic,
    createdAt,
  } = userObject;

  const distance =
    authUser?.location?.coordinates &&
    location?.coordinates
      ? getDistanceKm(
          authUser.location.coordinates[1],
          authUser.location.coordinates[0],
          location.coordinates[1],
          location.coordinates[0]
        )
      : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center px-4">

      <div className="w-full max-w-xl bg-background/95 rounded-3xl p-8 shadow-2xl overflow-hidden relative">

        {/* Close */}
        <button
          onClick={() => setShowProfile(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted/70 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <img
            src={profilePic || `${import.meta.env.BASE_URL}/images/user.jpg`}
            className="w-28 h-28 rounded-full object-cover ring-4 ring-foreground/10 mb-4"
            alt="profile"
          />

          <h2 className="text-xl font-semibold">
            {firstName} {lastName}
          </h2>

          <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
            {role}
          </p>

          {/* Distance */}
          {distance !== null && (
            <p className="mt-2 text-sm text-emerald-600 font-medium">
              📍 {distance} km away
            </p>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mt-8 text-sm">
          <InfoItem label="Age" value={age || "—"} />
          <InfoItem label="Email" value={email} />
          <InfoItem label="Mobile" value={mobile} />
          <InfoItem
            label="Member Since"
            value={
              createdAt
                ? new Date(createdAt).toLocaleDateString()
                : "—"
            }
          />
        </div>

        {/* Lawyer Section */}
        {role === "lawyer" && (
          <div className="mt-8 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Fields of Expertise
              </p>
              <div className="flex flex-wrap gap-2">
                {field.length ? (
                  field.map((f, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-muted text-xs font-medium"
                    >
                      {f}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                About
              </p>
              <p className="text-sm leading-relaxed">
                {description || "—"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* Distance util (Haversine) */
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // Earth radius (km)

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

const InfoItem = ({ label, value }) => (
  <div className="bg-muted/50 rounded-xl p-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-medium truncate">{value}</p>
  </div>
);

export default UserProfile;
