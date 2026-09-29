import { cn } from '@/lib/shadcn/utils';

// Each prompt demonstrates one capability: grounded answers, refusing to
// invent a product, complaint capture, and urgent fraud routing.
const SUGGESTED_PROMPTS = [
  'What loans do you offer?',
  "What's the interest rate on your car loan?",
  'I was charged twice. I want to make a complaint.',
  'Someone took money from my account.',
];

interface TryAskingProps {
  className?: string;
}

export function TryAsking({ className }: TryAskingProps) {
  return (
    <div className={cn('mt-6 w-full max-w-md rounded-lg border p-4 text-left text-sm', className)}>
      <p className="text-foreground font-semibold">Try asking:</p>
      <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <li key={prompt}>&ldquo;{prompt}&rdquo;</li>
        ))}
      </ul>
      <p className="text-muted-foreground mt-3 text-xs">
        Demo only: fictional SACCO. Please don&apos;t share real names, phone numbers, or PINs.
      </p>
    </div>
  );
}
