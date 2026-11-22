"use client";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Cloud, KeyRound, LoaderCircle, LockKeyhole, X } from "lucide-react";

type Photo = {
  id: string;
  name: string;
  mimeType: string;
  size: string | null;
  modifiedTime: string | null;
  url: string;
};

export function GalleryPhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [passError, setPassError] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/gallery/photos", { cache: "no-store" });
      if (r.status === 401) {
        setConnected(false);
        return;
      }
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Could not load photos.");
      setPhotos(data.photos ?? []);
      setConnected(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gallery request failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (!passphrase.trim()) return;
    setUnlocking(true);
    setPassError("");
    try {
      const res = await fetch("/api/auth/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase: passphrase.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Incorrect passphrase.");
      }
      setPassphrase("");
      await load();
    } catch (err) {
      setPassError(err instanceof Error ? err.message : "Access denied.");
    } finally {
      setUnlocking(false);
    }
  }

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : photos.length - 1));
  }, [photos.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev !== null && prev < photos.length - 1 ? prev + 1 : 0));
  }, [photos.length]);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  useEffect(() => {
    void load();
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedIndex === null) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIndex, handleClose, handlePrev, handleNext]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  const activePhoto = selectedIndex !== null ? photos[selectedIndex] : null;

  return (
    <div>
      {!connected && !loading && (
        <div className="gallery-status family-unlock-card" role="status">
          <div className="status-icon">
            <KeyRound size={17} />
          </div>
          <div className="status-copy">
            <strong>Enter Family Passphrase</strong>
            <span>Enter our private family code to enter the gallery.</span>
            <form onSubmit={handleUnlock} className="family-unlock-form">
              <input
                type="password"
                placeholder="Enter passphrase…"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="family-input"
                disabled={unlocking}
                autoFocus
              />
              <button type="submit" className="primary-button" disabled={unlocking || !passphrase.trim()}>
                {unlocking ? "Checking…" : "Unlock Gallery"} <ArrowUpRight size={14} />
              </button>
            </form>
            {passError && <span className="family-error">{passError}</span>}
            <div className="admin-connect-prompt">
              <span>Are you the administrator? </span>
              <a href="/api/admin/drive/connect" className="admin-link">
                <LockKeyhole size={11} /> Admin Sign-In with Google
              </a>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="gallery-status">
          <div className="status-icon">
            <LoaderCircle size={17} className="spin" />
          </div>
          <div className="status-copy">
            <strong>Opening your collection</strong>
            <span>Checking the selected Google Drive folder…</span>
          </div>
        </div>
      )}

      {error && (
        <div className="gallery-status" role="alert">
          <div className="status-icon">
            <Cloud size={17} />
          </div>
          <div className="status-copy">
            <strong>Gallery unavailable</strong>
            <span>{error}</span>
          </div>
          <button className="text-button" onClick={() => void load()}>
            Try again
          </button>
        </div>
      )}

      {connected && photos.length === 0 && !loading && (
        <div className="gallery-status">
          <div className="status-icon">
            <Cloud size={17} />
          </div>
          <div className="status-copy">
            <strong>No photos found yet</strong>
            <span>There are no supported image files in the selected folder or its subfolders.</span>
          </div>
        </div>
      )}

      {connected && photos.length > 0 && (
        <>
          <div className="photo-grid">
            {photos.map((photo, index) => (
              <button
                type="button"
                className="photo-tile photo-tile-button"
                key={photo.id}
                onClick={() => setSelectedIndex(index)}
                aria-label={`View ${photo.name}`}
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  loading="lazy"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
                <span className="photo-caption">{photo.name}</span>
              </button>
            ))}
          </div>
          <p className="photo-count">{photos.length} PHOTOGRAPHS · FROM YOUR SELECTED DRIVE FOLDER</p>
        </>
      )}

      {activePhoto !== null && (
        <div
          className="lightbox-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.name}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="lightbox-topbar">
            <span className="lightbox-counter">
              {(selectedIndex ?? 0) + 1} / {photos.length}
            </span>
            <span className="lightbox-title">{activePhoto.name}</span>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={handleClose}
              aria-label="Close photo view"
            >
              <X size={20} />
            </button>
          </div>

          <div
            className="lightbox-stage"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleClose();
            }}
          >
            {photos.length > 1 && (
              <button
                type="button"
                className="lightbox-nav-btn lightbox-prev"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label="Previous photo"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            <div
              className="lightbox-img-wrapper"
              onContextMenu={(e) => e.preventDefault()}
            >
              <img
                src={activePhoto.url}
                alt={activePhoto.name}
                className="lightbox-img"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              />
              <div
                className="lightbox-protection-guard"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              />
            </div>

            {photos.length > 1 && (
              <button
                type="button"
                className="lightbox-nav-btn lightbox-next"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Next photo"
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
