import { Aperture, ArrowUpRight, Camera, ChevronRight, Cloud, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

const moments = [
  { number: "01", title: "The little things", note: "Everyday, extraordinary", className: "moment-one" },
  { number: "02", title: "All together", note: "The people who feel like home", className: "moment-two" },
  { number: "03", title: "Somewhere new", note: "Places that stay with us", className: "moment-three" },
];

export default function HomePage() {
  const folderConfigured = Boolean(process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID);

  return (
    <main className="site-shell">
      <nav className="topbar" aria-label="Main navigation">
        <a className="brand" href="#home" aria-label="Stillframe home">
          <span className="brand-mark"><Aperture size={18} strokeWidth={1.7} /></span>
          <span>stillframe<span className="brand-period">.</span></span>
        </a>
        <div className="nav-right">
          <span className="private-label"><LockKeyhole size={12} /> PRIVATE FAMILY SPACE</span>
          <a className="nav-link" href="#about">About <ArrowUpRight size={13} /></a>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> A HOME FOR YOUR MEMORIES</div>
          <h1>Some moments<br />deserve to <em>stay.</em></h1>
          <p className="hero-description">A private place for the photographs, people, and little moments that make your story yours.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#gallery">Explore the gallery <ChevronRight size={16} /></a>
            <span className="quiet-note"><ShieldCheck size={14} /> Just for the family</span>
          </div>
        </div>
        <div className="hero-art" aria-label="Abstract photographic composition">
          <div className="art-glow" />
          <div className="art-frame frame-back"><div className="frame-landscape" /></div>
          <div className="art-frame frame-front"><div className="frame-portrait"><span className="sun-disc" /><span className="horizon" /><span className="silhouette" /></div></div>
          <div className="art-caption"><span>FIG. 01</span><span>MEMORIES, KEPT CLOSE</span></div>
          <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
        </div>
        <div className="hero-index"><span>01</span><span className="index-rule" /><span>03</span></div>
      </section>

      <section className="gallery-section" id="gallery">
        <div className="section-heading">
          <div><div className="eyebrow"><span className="eyebrow-line" /> THE COLLECTION</div><h2>Life, in <em>frames.</em></h2></div>
          <p>Not just pictures. Little pieces<br />of a life lived together.</p>
        </div>
        <div className="moment-grid">
          {moments.map((moment) => (
            <article className={`moment-card ${moment.className}`} key={moment.number}>
              <div className="moment-visual"><span className="moment-number">{moment.number}</span><span className="visual-mark"><Camera size={18} strokeWidth={1.4} /></span><div className="visual-texture" /></div>
              <div className="moment-meta"><div><h3>{moment.title}</h3><p>{moment.note}</p></div><ArrowUpRight size={17} /></div>
            </article>
          ))}
        </div>
        <div className="gallery-status" role="status">
          <div className="status-icon"><Cloud size={17} /></div>
          <div className="status-copy"><strong>{folderConfigured ? "Your gallery space is configured" : "Your private gallery is being prepared"}</strong><span>{folderConfigured ? "Drive folder is set. Secure Google authorization is the next step." : "Connect the family Drive to bring your photographs into one place."}</span></div>
          <span className="status-pill"><span /> SETUP</span>
        </div>
      </section>

      <section className="privacy-section" id="about">
        <div className="privacy-icon"><Sparkles size={19} /></div>
        <div><div className="eyebrow">MADE TO BE PRIVATE</div><h2>Your memories.<br /><em>Your circle.</em></h2></div>
        <p>Stillframe is designed for invited family members only. Your photos stay in your Google Drive; this gallery is a read-only window into the folder you choose.</p>
      </section>

      <footer className="footer"><a className="brand" href="#home"><span className="brand-mark"><Aperture size={16} /></span><span>stillframe<span className="brand-period">.</span></span></a><span>Made for the moments that matter.</span><span>© {new Date().getFullYear()} STILLFRAME</span></footer>
    </main>
  );
}
