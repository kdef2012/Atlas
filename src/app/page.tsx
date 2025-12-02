import { redirect } from 'next/navigation'

// For now, we are redirecting to the app dashboard.
// In the future, this could be a landing page.
export default function Home() {
  redirect('/onboarding/archetype');
}
