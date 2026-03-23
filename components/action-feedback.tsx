import { AlertCircle, CheckCircle2, Info } from "lucide-react";

const toneIcons = {
  error: AlertCircle,
  info: Info,
  success: CheckCircle2,
};

type ActionFeedbackProps = {
  tone?: keyof typeof toneIcons;
  title: string;
  message: string;
};

export function ActionFeedback({
  tone = "error",
  title,
  message,
}: ActionFeedbackProps) {
  const Icon = toneIcons[tone];
  const role = tone === "error" ? "alert" : "status";

  return (
    <div className={`feedback-banner feedback-banner--${tone}`} role={role}>
      <div className="feedback-banner__icon">
        <Icon size={18} />
      </div>
      <div className="feedback-banner__copy">
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
    </div>
  );
}
