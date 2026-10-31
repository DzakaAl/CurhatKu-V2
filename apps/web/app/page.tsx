import { redirect } from "next/navigation";

/** Root → dashboard (nav ada di (tabs) layout). */
export default function Home() {
  redirect("/dashboard");
}

