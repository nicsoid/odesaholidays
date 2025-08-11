import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LanguageSwitcher() {
  const { language, switchLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="px-2">
          <span className="text-lg">
            {language === 'uk' ? '🇺🇦' : '🇺🇸'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => switchLanguage('uk')}
          className={language === 'uk' ? 'bg-blue-50' : ''}
        >
          <span className="mr-2">🇺🇦</span>
          Українська
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => switchLanguage('en')}
          className={language === 'en' ? 'bg-blue-50' : ''}
        >
          <span className="mr-2">🇺🇸</span>
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}