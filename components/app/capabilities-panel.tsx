'use client';

import { EnvelopeSimple, GithubLogo, Globe } from '@phosphor-icons/react';
import { cn } from '@/lib/shadcn/utils';

// Engineering decisions a reviewer can verify in the repo and in a test call.
const ENGINEERING_POINTS = [
  'Answers only from approved documents (grounded RAG), and says so when it does not know',
  'Complaints validated with Pydantic and routed by code, not by the LLM',
  'Fraud and data-protection reports are never rate-limited',
  'Personal data kept out of logs; PINs and passwords refused',
  'Automated tests and CI on every push, plus a findings log from real test calls',
];

// Topic level only, so this list does not drift from the agent's knowledge files.
const KNOWLEDGE_TOPICS = [
  'Chuma Personal Loan: eligibility, how to apply, rates and fees',
  'Complaints process: channels, timelines, escalation',
  "Product catalogue: what the SACCO does and doesn't offer",
];

const LINKS = [
  { href: 'https://github.com/DILHT', label: 'GitHub', Icon: GithubLogo },
  { href: 'https://danielkasambala.netlify.app', label: 'Portfolio', Icon: Globe },
  { href: 'mailto:danielkasambala51@gmail.com', label: 'Email', Icon: EnvelopeSimple },
];

interface CapabilitiesPanelProps {
  className?: string;
}

export function CapabilitiesPanel({ className }: CapabilitiesPanelProps) {
  return (
    <aside className={cn('bg-background rounded-lg border p-5 text-left text-sm', className)}>
      <h2 className="text-foreground font-mono text-xs font-bold tracking-wider uppercase">
        Under the hood
      </h2>
      <ul className="text-muted-foreground mt-3 list-disc space-y-2 pl-5">
        {ENGINEERING_POINTS.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>

      <h2 className="text-foreground mt-6 font-mono text-xs font-bold tracking-wider uppercase">
        What it knows
      </h2>
      <ul className="text-muted-foreground mt-3 list-disc space-y-2 pl-5">
        {KNOWLEDGE_TOPICS.map((topic) => (
          <li key={topic}>{topic}</li>
        ))}
      </ul>
      <p className="text-muted-foreground mt-3 text-xs">
        Ask about anything outside these topics to see it decline honestly.
      </p>

      <div className="mt-6 border-t pt-4">
        <p className="text-foreground font-medium">Built by Daniel Kasambala</p>
        <div className="mt-2 flex flex-wrap gap-4">
          {LINKS.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('mailto:') ? undefined : '_blank'}
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 underline-offset-4 hover:underline"
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
