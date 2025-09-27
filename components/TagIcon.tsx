"use client";
import { Icon } from "@iconify/react";

export default function TagIcon({ name, size=18, className="" }: { name: string; size?: number; className?: string }) {
  return <Icon icon={name} width={size} height={size} className={className} />;
}
