import Image from 'next/image';

import { Link } from '@/core/i18n/navigation';
import {
  BrandLogo,
  ByteplusCookieSettingsButton,
  LocaleSelector,
  SmartIcon,
} from '@/shared/blocks/common';
import { NavItem } from '@/shared/types/blocks/common';
import { Footer as FooterType } from '@/shared/types/blocks/landing';

function FooterLink({ item }: { item: NavItem }) {
  const href = item.url || '/';
  const className =
    'text-[10px] leading-[1.45] text-[#828894] transition-colors hover:text-white';

  return /^(https?:\/\/|mailto:|tel:)/i.test(href) ? (
    <a
      href={href}
      target={item.target || '_self'}
      rel={item.target === '_blank' ? 'noreferrer noopener' : undefined}
      className={className}
    >
      {item.title}
    </a>
  ) : (
    <Link href={href} target={item.target || '_self'} className={className}>
      {item.title}
    </Link>
  );
}

export function ByteplusFooter({ footer }: { footer: FooterType }) {
  return (
    <footer
      id={footer.id}
      className="overflow-x-hidden bg-[#090a0d] px-6 pt-16 pb-6 text-white"
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="grid gap-12 border-b border-[#25282f] pb-14 md:grid-cols-[0.25fr_0.75fr]">
          <div className="min-w-0">
            {footer.brand ? <BrandLogo brand={footer.brand} /> : null}
            {footer.brand?.description ? (
              <p
                className="mt-5 max-w-[260px] text-[11px] leading-[1.55] text-[#8c929d]"
                dangerouslySetInnerHTML={{
                  __html: footer.brand.description,
                }}
              />
            ) : null}
            {footer.social?.items?.length ? (
              <div className="mt-7 flex gap-2.5">
                {footer.social.items.map((item) => (
                  <a
                    href={item.url || '/'}
                    target={item.target || '_blank'}
                    rel="noreferrer noopener"
                    aria-label={item.title || 'Social media'}
                    className="grid size-8 place-items-center rounded-full border border-[#292c33] text-white transition-colors hover:border-[#69707c]"
                    key={item.title}
                  >
                    {item.icon ? (
                      <SmartIcon name={item.icon as string} size={15} />
                    ) : null}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <nav className="grid min-w-0 grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
            {footer.nav?.items.map((column) => (
              <section
                className="flex min-w-0 flex-col gap-2.5"
                key={column.title}
              >
                <h2 className="mb-2 min-h-8 text-[11px] leading-[1.35] font-semibold">
                  {column.title}
                </h2>
                {column.children?.map((item) => (
                  <FooterLink item={item} key={item.title} />
                ))}
              </section>
            ))}
          </nav>
        </div>

        <div className="flex min-h-[62px] flex-wrap items-start gap-x-6 gap-y-3 pt-5 text-[9px] text-[#747a85]">
          <span>
            {footer.copyright ||
              `© ${new Date().getFullYear()} BytePlus Pte Ltd.`}
          </span>
          <div className="flex flex-wrap items-center gap-3">
            {footer.agreement?.items.map((item) => (
              <FooterLink item={item} key={item.title} />
            ))}
            {footer.show_cookie_settings ? (
              <ByteplusCookieSettingsButton className="border-0 bg-transparent text-[10px] text-[#828894] hover:text-white" />
            ) : null}
          </div>

          {footer.attribution ? (
            <a
              href={footer.attribution.url || '/'}
              className="ml-auto flex items-center gap-2 text-[9px] text-[#747a85] max-lg:ml-0"
            >
              {footer.attribution.text}
              {footer.attribution.image ? (
                <Image
                  src={footer.attribution.image.src}
                  alt={footer.attribution.image.alt || ''}
                  width={footer.attribution.image.width || 105}
                  height={footer.attribution.image.height || 18}
                  className="h-auto w-[105px] object-contain"
                />
              ) : null}
            </a>
          ) : null}

          {footer.show_locale !== false ? (
            <div className="ml-auto [&_button]:!text-[10px] [&_button]:!text-[#828894]">
              <LocaleSelector type="button" />
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
