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
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {language === 'uk' ? 'Українська' : 'English'}
          </span>
          <span className="sm:hidden">
            {language === 'uk' ? 'UK' : 'EN'}
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