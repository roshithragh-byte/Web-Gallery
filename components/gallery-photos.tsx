"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight, Cloud, KeyRound, LoaderCircle, LockKeyhole } from "lucide-react";

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

  useEffect(() => {
    void load();
  }, []);

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
            {photos.map((photo) => (
              <a className="photo-tile" href={photo.url} key={photo.id} target="_blank" rel="noreferrer">
                <img src={photo.url} alt={photo.name} loading="lazy" />
                <span className="photo-caption">{photo.name}</span>
              </a>
            ))}
          </div>
          <p className="photo-count">{photos.length} PHOTOGRAPHS · FROM YOUR SELECTED DRIVE FOLDER</p>
        </>
      )}
    </div>
  );
}
