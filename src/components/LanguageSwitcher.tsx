
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages, Check } from "lucide-react";
import { useState } from "react";

export function LanguageSwitcher() {
  const [lang, setLang] = useState<"vi" | "en">("vi");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 h-9 px-3 border border-transparent hover:border-border transition-all">
          <Languages className="h-4 w-4" />
          <span className="text-xs font-bold uppercase">{lang}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem 
          onClick={() => setLang("vi")}
          className="flex items-center justify-between cursor-pointer"
        >
          <span>Tiếng Việt</span>
          {lang === "vi" && <Check className="h-3 w-3 text-accent" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLang("en")}
          className="flex items-center justify-between cursor-pointer"
        >
          <span>English</span>
          {lang === "en" && <Check className="h-3 w-3 text-accent" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
