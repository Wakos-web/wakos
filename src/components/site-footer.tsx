import { Link } from "@tanstack/react-router";
import { SCHOOL_NAME, SCHOOL_MOTTO } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="bg-[#153816] text-[#FBF6E5]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#97C600] mb-3">About</p>
            <ul className="space-y-1.5">
              <li><Link to="/about" className="text-xs text-[#FBF6E5]/80 hover:text-[#97C600] transition-colors">Our Story</Link></li>
              <li><Link to="/academics" className="text-xs text-[#FBF6E5]/80 hover:text-[#97C600] transition-colors">Academics</Link></li>
              <li><Link to="/student-life" className="text-xs text-[#FBF6E5]/80 hover:text-[#97C600] transition-colors">Student Life</Link></li>
              <li><Link to="/athletics" className="text-xs text-[#FBF6E5]/80 hover:text-[#97C600] transition-colors">Athletics</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#97C600] mb-3">Community</p>
            <ul className="space-y-1.5">
              <li><Link to="/clubs" className="text-xs text-[#FBF6E5]/80 hover:text-[#97C600] transition-colors">Clubs</Link></li>
              <li><Link to="/alumni" className="text-xs text-[#FBF6E5]/80 hover:text-[#97C600] transition-colors">Alumni</Link></li>
              <li><Link to="/giving" className="text-xs text-[#FBF6E5]/80 hover:text-[#97C600] transition-colors">Giving</Link></li>
              <li><Link to="/campus-stores" className="text-xs text-[#FBF6E5]/80 hover:text-[#97C600] transition-colors">Campus Stores</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#97C600] mb-3">Connect</p>
            <ul className="space-y-1.5">
              <li><Link to="/admissions" className="text-xs text-[#FBF6E5]/80 hover:text-[#97C600] transition-colors">Admissions</Link></li>
              <li><Link to="/contact" className="text-xs text-[#FBF6E5]/80 hover:text-[#97C600] transition-colors">Contact</Link></li>
              <li><Link to="/calendar" className="text-xs text-[#FBF6E5]/80 hover:text-[#97C600] transition-colors">Calendar</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#97C600] mb-3">Visit</p>
            <address className="text-xs not-italic leading-relaxed text-[#FBF6E5]/80">
              Wairaka, Jinja<br />Uganda<br />info@mmcollegewairaka.sc.ug<br />+256 332 277 476
            </address>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-[#FBF6E5]/10 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <p className="text-[10px] text-[#FBF6E5]/50">Copyright 2026 {SCHOOL_NAME}. All rights reserved.</p>
          <p className="text-[10px] text-[#FBF6E5]/50">{SCHOOL_MOTTO}</p>
          <p className="text-[10px] text-[#FBF6E5]/50">Powered by <a href="https://www.alerotek.co.ke" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" style={{color:"#16a34a"}}>Alerotek</a></p>
        </div>
      </div>
    </footer>
  );
}