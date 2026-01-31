"use client";

import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/language";

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button type="button" variant="outline" size="sm" onClick={toggleLanguage}>
      {language === "ar" ? "English" : "العربية"}
    </Button>
  );
}
