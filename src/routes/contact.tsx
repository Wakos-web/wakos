import { createFileRoute, Link } from "@tanstack/react-router";
import { IMAGES } from "@/lib/content";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [{ title: "Contact ,  M.M College Wairaka" }],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div>
      <section className="relative h-[40vh] min-h-[280px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMAGES.campus} alt="WACOS campus" className="h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-12">
          <h1 className="font-display text-5xl md:text-6xl text-white font-bold tracking-tight mb-4">Contact Us</h1>
          <p className="text-lg text-white/80 max-w-2xl font-body">Get in touch with M.M College Wairaka.</p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl bg-stone-50 border border-stone-200 p-8 text-center">
            <MapPin className="h-8 w-8 text-green-800 mx-auto mb-4" />
            <h3 className="font-display text-lg font-bold text-stone-900 mb-2">Address</h3>
            <p className="text-stone-600 font-body text-sm">M.M College Wairaka<br />Jinja, Uganda<br />Along Jinja-Iganga Highway</p>
          </div>
          <div className="rounded-2xl bg-stone-50 border border-stone-200 p-8 text-center">
            <Phone className="h-8 w-8 text-green-800 mx-auto mb-4" />
            <h3 className="font-display text-lg font-bold text-stone-900 mb-2">Phone</h3>
            <p className="text-stone-600 font-body text-sm">+256 414 123 456</p>
            <p className="text-stone-500 font-body text-xs mt-1">Monday to Friday, 8am - 5pm</p>
          </div>
          <div className="rounded-2xl bg-stone-50 border border-stone-200 p-8 text-center">
            <Mail className="h-8 w-8 text-green-800 mx-auto mb-4" />
            <h3 className="font-display text-lg font-bold text-stone-900 mb-2">Email</h3>
            <p className="text-stone-600 font-body text-sm">info@wacos.ac.ug</p>
            <p className="text-stone-500 font-body text-xs mt-1">Admissions inquiries welcome</p>
          </div>
        </div>
      </section>

      <section className="bg-stone-50 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-stone-900 mb-4">Admissions Inquiry</h2>
          <p className="text-stone-600 font-body mb-8">Interested in enrolling your child? Fill out the admissions inquiry form.</p>
          <Link to="/admissions" className="inline-flex items-center gap-2 bg-green-900 text-white px-8 py-4 rounded-full font-semibold hover:bg-green-800 transition-colors">
            Go to Admissions
          </Link>
        </div>
      </section>
    </div>
  );
}
