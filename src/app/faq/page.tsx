import Link from 'next/link';

const faqs = [
  {
    question: 'How long does a typical tune take?',
    answer:
      'Most ECU tuning sessions take 2–4 hours depending on the vehicle and the package selected.',
  },
  {
    question: 'Is tuning safe for daily driving?',
    answer:
      'Yes. Our calibrations prioritize reliability and drivability while delivering measurable gains.',
  },
  {
    question: 'Do I need hardware upgrades for a tune?',
    answer:
      'Stage 1 can be done on stock hardware. Stage 2+ typically requires supporting mods.',
  },
  {
    question: 'Can you restore the stock tune?',
    answer:
      'Yes. We can reflash the vehicle to stock at any time.',
  },
  {
    question: 'Do you offer dyno verification?',
    answer:
      'Yes. All performance packages include before/after dyno runs for verification.',
  },
];

export default function FaqPage() {
  return (
    <div className="bg-pure-black text-pure-white">
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-pure-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute w-[700px] h-[700px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(255, 10, 10, 0.35) 0%, transparent 70%)',
              top: '-20%',
              right: '-10%',
              filter: 'blur(90px)',
            }}
          />
        </div>
        <div className="section-container relative z-10 text-center">
          <p className="text-red-primary font-light tracking-[0.3em] uppercase text-xs mb-6">
            Help Center
          </p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-pure-white mb-8">
            FAQs
          </h1>
          <p className="text-lg text-grey-300 max-w-2xl mx-auto leading-relaxed">
            Answers to the most common questions about tuning, dyno testing,
            and performance packages.
          </p>
        </div>
      </section>

      <section className="section-padding section-light">
        <div className="section-container">
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((item) => (
              <div key={item.question} className="card-premium-light p-6">
                <h2 className="text-xl font-semibold text-rich-black mb-2">
                  {item.question}
                </h2>
                <p className="text-grey-600 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/contact" className="btn-primary">
              Still have questions? Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
