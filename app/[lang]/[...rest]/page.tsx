import { notFound } from "next/navigation";

// unknown addresses render the styled 404 in the page language, on demand
export const dynamicParams = true;

export default function CatchAll() {
  notFound();
}
