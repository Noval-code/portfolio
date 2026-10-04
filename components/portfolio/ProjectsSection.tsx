import Image from "next/image";
import ScrollStack, { ScrollStackItem } from "../ScrollStack";
import ShinyText from "../ShinyText";

interface Project {
  number: string;
  title: string;
  type: string;
  description: string;
  stack: string[];
  highlight: string;
  badges: string[];
  clients: string[];
  liveUrl: string;
  repoUrl: string;
  image?: string;
}

interface ProjectsSectionProps {
  kicker: string;
  title: string;
  projects: Project[];
  demoComingSoon: string;
  clientsLabel: string;
  finalKicker: string;
  finalTitle: string;
  finalBody: string;
}

export default function ProjectsSection({
  kicker,
  title,
  projects,
  demoComingSoon,
  clientsLabel,
  finalKicker,
  finalTitle,
  finalBody,
}: ProjectsSectionProps) {
  return (
    <section id="work" className="projects-pin">
      <div className="projects-heading reveal">
        <ShinyText
          text={kicker}
          className="experience-work-history"
          speed={4.5}
          color="rgba(176, 182, 191, 0.72)"
          shineColor="rgba(255, 255, 255, 0.95)"
          spread={88}
          yoyo
          delay={0.3}
        />
        <h2 className="experience-title">{title}</h2>
      </div>
      <ScrollStack className="projects-stack" blurAmount={4}>
        {projects.map((project) => (
          <ScrollStackItem key={project.title} itemClassName="project-card">
            <div className="mockup">
              {project.image && (
                <Image src={project.image} alt={project.title} fill className="project-mockup-image" />
              )}
            </div>
            <div className="project-body">
              <div className="project-top">
                <span>{project.number}</span>
                <span>{project.type}</span>
              </div>
              {(project.highlight || project.badges.length > 0) && (
                <div className="project-badges">
                  {project.highlight && <span className="project-highlight">{project.highlight}</span>}
                  {project.badges.map((badge) => (
                    <span key={badge} className="project-highlight project-badge-pwa">{badge}</span>
                  ))}
                </div>
              )}
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              {(project.liveUrl || project.repoUrl) ? (
                <div className="project-links">
                  {project.liveUrl && (
                    <a className="project-link" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17L17 7" />
                        <path d="M7 7h10v10" />
                      </svg>
                      Live
                    </a>
                  )}
                  {project.repoUrl && (
                    <a className="project-link" href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17L17 7" />
                        <path d="M7 7h10v10" />
                      </svg>
                      GitHub
                    </a>
                  )}
                </div>
              ) : (
                <div className="project-links">
                  <span className="project-link" style={{ opacity: 0.7, pointerEvents: "none" }}>
                    {demoComingSoon}
                  </span>
                </div>
              )}
              <ul className="project-stack" aria-label="Tech stack">
                {project.stack.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
              {project.clients.length > 0 && (
                <div className="project-clients">
                  <span className="project-clients-label">{clientsLabel}</span>
                  <ul aria-label={clientsLabel}>
                    {project.clients.map((client) => (
                      <li key={client}>{client}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ScrollStackItem>
        ))}
        <ScrollStackItem itemClassName="project-card final-card">
          <p className="section-kicker">{finalKicker}</p>
          <h3>{finalTitle}</h3>
          <p>{finalBody}</p>
        </ScrollStackItem>
      </ScrollStack>
    </section>
  );
}