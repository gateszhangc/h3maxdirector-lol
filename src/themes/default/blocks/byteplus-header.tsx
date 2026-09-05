'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Menu, Sparkles, X } from 'lucide-react';

import { Link, usePathname } from '@/core/i18n/navigation';
import { BrandLogo, SignUser } from '@/shared/blocks/common';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/shared/components/ui/navigation-menu';
import { cn } from '@/shared/lib/utils';
import { Button, NavItem } from '@/shared/types/blocks/common';
import { Header as HeaderType } from '@/shared/types/blocks/landing';

function isExternal(url: string) {
  return /^(https?:\/\/|mailto:|tel:)/i.test(url);
}

function SiteLink({
  item,
  className,
  onClick,
}: {
  item: NavItem;
  className?: string;
  onClick?: () => void;
}) {
  const url = item.url || '/';
  const content = item.title || '';

  return isExternal(url) ? (
    <a
      href={url}
      target={item.target || '_self'}
      rel={item.target === '_blank' ? 'noreferrer noopener' : undefined}
      className={className}
      onClick={onClick}
    >
      {content}
    </a>
  ) : (
    <Link
      href={url}
      target={item.target || '_self'}
      className={className}
      onClick={onClick}
    >
      {content}
    </Link>
  );
}

function MegaMenu({ groups }: { groups: NavItem[] }) {
  return (
    <NavigationMenuContent className="w-[min(820px,calc(100vw-48px))] rounded-none border border-[#e4e8ee] bg-white p-0 text-[#0c0d0e] shadow-[0_20px_48px_rgba(16,24,40,0.09)]">
      <div className="grid grid-cols-3 gap-10 p-8">
        {groups.map((group) => (
          <section key={group.title} className="min-w-0">
            <p className="mb-3 text-[10px] font-semibold tracking-[0.08em] text-[#7b8290] uppercase">
              {group.title}
            </p>
            <div className="flex flex-col gap-1">
              {(group.children || [group]).map((item) => (
                <NavigationMenuLink key={item.title} asChild>
                  <SiteLink
                    item={item}
                    className="group/link rounded-md px-2 py-2 transition-colors hover:bg-[#f5f7fa]"
                  />
                </NavigationMenuLink>
              ))}
            </div>
            {group.description ? (
              <p className="mt-2 px-2 text-[10px] leading-4 text-[#737a87]">
                {group.description}
              </p>
            ) : null}
          </section>
        ))}
      </div>
    </NavigationMenuContent>
  );
}

function HeaderAction({ action }: { action: Button }) {
  const primary = action.type === 'primary';
  return (
    <SiteLink
      item={action}
      className={cn(
        'inline-flex min-h-[34px] items-center justify-center text-[11px] font-medium whitespace-nowrap transition-colors',
        primary
          ? 'rounded-full bg-[#0c0d0e] px-[17px] text-white hover:bg-[#27292d]'
          : 'text-[#1d2129] hover:text-[#1664ff]'
      )}
    />
  );
}

export function ByteplusHeader({ header }: { header: HeaderType }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const primaryActions = (header.buttons || []).filter(
    (button) => button.type === 'primary'
  );
  const secondaryActions = (header.buttons || []).filter(
    (button) => button.type !== 'primary'
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header
      data-byteplus-header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b border-[#edf0f4] bg-white/96 text-[#0c0d0e] backdrop-blur-[18px] transition-shadow',
        scrolled && 'shadow-[0_8px_30px_rgba(16,24,40,0.06)]'
      )}
    >
      <div className="mx-auto flex h-16 w-[min(1380px,calc(100%-48px))] items-center max-sm:w-[calc(100%-48px)]">
        {header.brand ? <BrandLogo brand={header.brand} /> : null}

        <NavigationMenu viewport={false} className="ml-7 hidden xl:flex">
          <NavigationMenuList className="gap-6">
            {header.nav?.items.map((item) =>
              item.children?.length ? (
                <NavigationMenuItem key={item.title}>
                  <NavigationMenuTrigger className="h-9 gap-1 rounded-none bg-transparent px-0 text-xs font-medium text-[#24272d] shadow-none hover:bg-transparent hover:text-[#1664ff] focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-[#1664ff]">
                    {item.title}
                  </NavigationMenuTrigger>
                  <MegaMenu groups={item.children} />
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem key={item.title}>
                  <NavigationMenuLink asChild>
                    <SiteLink
                      item={item}
                      className={cn(
                        'inline-flex h-9 items-center gap-1.5 text-xs font-medium transition-colors hover:text-[#1664ff]',
                        item.type === 'accent' && 'text-[#5e76ff]',
                        pathname.endsWith(item.url || '__never__') &&
                          'text-[#1664ff]'
                      )}
                    />
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            )}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto hidden items-center gap-5 xl:flex">
          {secondaryActions.map((action) => (
            <HeaderAction action={action} key={action.title} />
          ))}
          {header.show_sign ? (
            <div>
              <SignUser
                userNav={header.user_nav}
                signButtonSize="sm"
                signButtonClassName="!m-0 !min-h-0 !border-0 !bg-transparent !p-0 !text-[11px] !text-[#111] !shadow-none"
              />
            </div>
          ) : null}
          {primaryActions.map((action) => (
            <HeaderAction action={action} key={action.title} />
          ))}
        </div>

        <button
          type="button"
          className="relative ml-auto grid size-10 place-items-center xl:hidden"
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="h-[calc(100vh-64px)] overflow-y-auto border-t border-[#edf0f4] bg-white px-6 pb-10 xl:hidden">
          <Accordion type="single" collapsible className="w-full">
            {header.nav?.items.map((item) =>
              item.children?.length ? (
                <AccordionItem
                  value={item.title || ''}
                  key={item.title}
                  className="border-[#edf0f4]"
                >
                  <AccordionTrigger className="py-4 text-base font-medium hover:no-underline">
                    {item.title}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5">
                    <div className="space-y-5">
                      {item.children.map((group) => (
                        <section key={group.title}>
                          <p className="mb-2 text-[10px] font-semibold tracking-[0.08em] text-[#7b8290] uppercase">
                            {group.title}
                          </p>
                          <div className="flex flex-col">
                            {(group.children || [group]).map((subItem) => (
                              <SiteLink
                                key={subItem.title}
                                item={subItem}
                                onClick={() => setMobileOpen(false)}
                                className="py-2.5 text-sm text-[#303132]"
                              />
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <SiteLink
                  key={item.title}
                  item={item}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex min-h-14 items-center border-b border-[#edf0f4] text-base font-medium',
                    item.type === 'accent' && 'text-[#5e76ff]'
                  )}
                />
              )
            )}
          </Accordion>
          <div className="mt-7 flex flex-col gap-4">
            {secondaryActions.map((action) => (
              <HeaderAction action={action} key={action.title} />
            ))}
            {header.show_sign ? (
              <div>
                <SignUser
                  userNav={header.user_nav}
                  signButtonClassName="!m-0 !w-full !border-[#0c0d0e] !bg-transparent !text-[#111]"
                />
              </div>
            ) : null}
            {primaryActions.map((action) => (
              <HeaderAction action={action} key={action.title} />
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
