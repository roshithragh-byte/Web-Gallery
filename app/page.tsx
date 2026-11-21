import { Aperture, ArrowUpRight, ChevronRight, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { GalleryPhotos } from "@/components/gallery-photos";

export default function HomePage() {
  return (
    <main className="site-shell">
      <nav className="topbar" aria-label="Main navigation">
        <a className="brand" href="#home" aria-label="Stillframe home"><span className="brand-mark"><Aperture size={18} strokeWidth={1.7} /></span><span>stillframe<span className="brand-period">.</span></span></a>
        <div className="nav-right"><span className="private-label"><LockKeyhole size={12} /> PRIVATE FAMILY SPACE</span><a className="nav-link" href="#about">About <ArrowUpRight size={13} /></a></div>
      </nav>
      <section className="hero" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> A HOME FOR YOUR MEMORIES</div>
          <h1>Some moments<br />deserve to <em>stay.</em></h1>
          <p className="hero-description">A private place for the photographs, people, and little moments that make your story yours.</p>
          <div className="hero-actions"><a className="primary-button" href="#gallery">Explore the gallery <ChevronRight size={16} /></a><span className="quiet-note"><ShieldCheck size={14} /> Private access</span></div>
        </div>
        <div className="hero-art" aria-label="Abstract photographic composition"><div className="art-glow" /><div className="art-frame frame-back"><div className="frame-landscape" /></div><div className="art-frame frame-front"><div className="frame-portrait"><span className="sun-disc" /><span className="horizon" /><span className="silhouette" /></div></div><div className="art-caption"><span>FIG. 01</span><span>MEMORIES, KEPT CLOSE</span></div><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /></div>
        <div className="hero-index"><span>01</span><span className="index-rule" /><span>03</span></div>
      </section>
      <section className="gallery-section" id="gallery">
        <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> THE COLLECTION</div><h2>Life, in <em>frames.</em></h2></div><p>Your selected Drive folder.<br />Only the moments you choose.</p></div>
        <GalleryPhotos />
      </section>
      <section className="privacy-section" id="about"><div className="privacy-icon"><Sparkles size={19} /></div><div><div className="eyebrow">MADE TO BE PRIVATE</div><h2>Your memories.<br /><em>Your circle.</em></h2></div><p>Stillframe reads images from the single Google Drive folder selected by the administrator. Photo delivery is authenticated and read-only.</p></section>
      <footer className="footer"><a className="brand" href="#home"><span className="brand-mark"><Aperture size={16} /></span><span>stillframe<span className="brand-period">.</span></span></a><span>Made for the moments that matter.</span><span>© {new Date().getFullYear()} STILLFRAME</span></footer>
    </main>
  );
}
