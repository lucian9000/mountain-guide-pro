import { Dumbbell, Mountain, Users, type LucideIcon } from "lucide-react";

export interface TrainingProgramme {
  /** Slug used to match a `pricing` row (tour_slug) and for ?tour= deep links. */
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** True when there is no fixed price — always enquire via WhatsApp. */
  contactForPricing?: boolean;
}

/**
 * Fitness programmes. Single source of truth shared by the homepage Fitness
 * section and the quick-book panel, so the two can never drift.
 */
export const trainingProgrammes: TrainingProgramme[] = [
  {
    id: "strength-training",
    title: "Strength Training",
    description: "Personalized programs for beginners to advanced athletes.",
    icon: Dumbbell,
  },
  {
    id: "trail-fitness",
    title: "Trail Fitness",
    description: "Hybrid outdoor + gym sessions for uphill power and endurance.",
    icon: Mountain,
  },
  {
    id: "custom-programs",
    title: "Custom Programs",
    description: "4-12 week programs tailored to your specific goals.",
    icon: Users,
    // Scoped per client, so there is no standing price — always an enquiry.
    contactForPricing: true,
  },
];
