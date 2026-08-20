import SubscribeForm from "./subscribe-form";
import RevealObserver from "./reveal-observer";
import CinematicHero from "./cinematic-hero";

export default function Home() {
  return (
    <main>
      <section className="hero" aria-label="Elsewhere">
        <h1 className="sr-only">Elsewhere</h1>
        <CinematicHero />
        <div className="hero-title-veil" aria-hidden="true" />
        <img className="hero-logo" src="/elsewhere-logo-parchment.png" alt="Elsewhere" />
        <p className="hero-whisper">A different kind of retreat.</p>
      </section>

      <section className="idea" id="idea" aria-labelledby="idea-title">
        <div className="idea-heading reveal">
          <p className="eyebrow">The Elsewhere idea</p>
          <h2 id="idea-title">Retreats written<br />like <em>chapters.</em></h2>
        </div>
        <p className="idea-copy reveal">Elsewhere creates small-group retreats shaped around the rhythm of a place — its food, movement, culture, rituals and the pleasure of briefly belonging somewhere new.</p>
        <figure className="trace-film reveal">
          <video autoPlay muted loop playsInline preload="metadata" poster="/posters/elsewhere-traces.jpg" aria-label="A quiet glimpse of life elsewhere">
            <source src="/media/elsewhere-traces.mp4" type="video/mp4" />
          </video>
          <figcaption>Notes from elsewhere / 01</figcaption>
        </figure>
      </section>

      <section className="invitation" id="invitation" aria-labelledby="invitation-title">
        <div className="invitation-inner reveal">
          <p className="eyebrow">An invitation</p>
          <div className="invitation-layout">
            <h2 id="invitation-title"><span>Chapter One</span><br /><em>is being written.</em></h2>
            <div className="invite-action">
              <p className="invite-copy"><span>Be among the first to discover</span><span>where we’re going.</span></p>
              <SubscribeForm />
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-meta">
          <a href="https://www.instagram.com/meet_elsewhere/" target="_blank" rel="noopener noreferrer">@MEET_ELSEWHERE</a>
          <span>© 2026 ELSEWHERE</span>
        </div>
      </footer>

      <RevealObserver />
    </main>
  );
}
