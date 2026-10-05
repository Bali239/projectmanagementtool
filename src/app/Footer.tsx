import Link from "next/link"
import { PanelsTopLeft } from "lucide-react"

function GitHubMark({ className }: { className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.3 9.42 7.88 10.95.58.1.79-.25.79-.56v-2.17c-3.2.7-3.88-1.36-3.88-1.36-.53-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.67 1.25 3.32.96.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.77 1.06.77 2.14v3.17c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" /></svg>
}

function LinkedInMark({ className }: { className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM8.07 18.34H5.1V9.5h2.97v8.84ZM6.59 8.29a1.72 1.72 0 1 1 0-3.44 1.72 1.72 0 0 1 0 3.44Zm11.75 10.05h-2.97v-4.3c0-1.03-.02-2.35-1.43-2.35-1.43 0-1.65 1.12-1.65 2.27v4.38H9.32V9.5h2.85v1.21h.04c.4-.7 1.37-1.43 2.82-1.43 3.02 0 3.58 1.99 3.58 4.58v4.48Z" /></svg>
}

// 1. Categorize links logically (Information Architecture)
const footerNavigation = {
  product: [
    { name: "Home", href: "/" },
    { name: "How it works", href: "/howwork" },
    // { name: "Pricing", href: "/pricing" },
    // { name: "Changelog", href: "/changelog" },
  ],
  resources: [
    { name: "How to use", href: "/howuse" },
    // { name: "Help Center", href: "/help" },
    // { name: "Blog", href: "/blog" },
    // { name: "Community", href: "/community" },
  ],
  company: [
    { name: "About Us", href: "/aboutus" },
    // { name: "Careers", href: "/careers" },
    // { name: "Contact", href: "/contact" },
  ],
  legal: [
    // { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/termofservice" },
    // { name: "Cookie Policy", href: "/cookies" },
  ],
  social: [
    // { name: "Twitter", href: "#", icon: AtSign },
    { name: "GitHub", href: "https://github.com/Bali239", icon: GitHubMark },
    { name: "LinkedIn", href: "https://www.linkedin.com/in/muhammad-bilal-133996274", icon: LinkedInMark },
  ],
}

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    // 2. High Contrast Demarcation (Dark background) & Generous Whitespace (py-16)
    <footer className="bg-slate-950 text-slate-400" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Site Footer
      </h2>
      
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          
          {/* Brand Anchor Column */}
          <div className="space-y-8 xl:col-span-1">
            <Link 
              href="/" 
              className="group flex w-fit items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm transition-transform duration-200 group-hover:-rotate-3">
                <PanelsTopLeft size={20} />
              </span>
              <span>
                <span className="block text-lg font-bold text-white">LetsDo</span>
              </span>
            </Link>
            <p className="text-sm leading-6 text-slate-400 max-w-xs">
              A little more clarity for the work that matters. Streamline your workflow and boost productivity.
            </p>
            
            {/* Social Icons */}
            <div className="flex space-x-6">
              {footerNavigation.social.map((item) => (
                <a 
                  key={item.name} 
                  href={item.href} 
                  className="text-slate-500 hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Categorized Navigation Columns */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                {/* Typographic Hierarchy: Bold white headers */}
                <h3 className="text-sm font-semibold leading-6 text-white">Product</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerNavigation.product.map((item) => (
                    <li key={item.name}>
                      <Link 
                        href={item.href} 
                        className="text-sm leading-6 hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Resources</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerNavigation.resources.map((item) => (
                    <li key={item.name}>
                      <Link 
                        href={item.href} 
                        className="text-sm leading-6 hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerNavigation.company.map((item) => (
                    <li key={item.name}>
                      <Link 
                        href={item.href} 
                        className="text-sm leading-6 hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerNavigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link 
                        href={item.href} 
                        className="text-sm leading-6 hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 3. The Sub-Footer (Bottom Bar) */}
        <div className="mt-7 border-t border-slate-800 pt-8 sm:mt-20 lg:mt-24 flex md:flex-row justify-center items-center gap-4">
          <p className="text-xs leading-5 text-slate-400">
            &copy; {currentYear} LetsDo Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
