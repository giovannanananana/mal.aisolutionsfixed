import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const stats = [
  { value: 150, suffix: '+', label: 'Projects Delivered' },
  { value: 98, suffix: '%', label: 'Client Satisfaction' },
  { value: 50, suffix: '+', label: 'AI Integrations' },
  { value: 24, suffix: '/7', label: 'Support Available' },
];

const Stats = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [counters, setCounters] = useState(stats.map(() => 0));
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!sectionRef.current || hasAnimated.current) return;

    // Use IntersectionObserver instead of ScrollTrigger for better Vercel compatibility
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;

            stats.forEach((stat, index) => {
              const obj = { value: 0 };
              gsap.to(obj, {
                value: stat.value,
                duration: 2,
                ease: 'power4.out',
                onUpdate: () => {
                  setCounters((prev) => {
                    const newCounters = [...prev];
                    newCounters[index] = Math.floor(obj.value);
                    return newCounters;
                  });
                },
              });
            });
          }
        });
      },
      {
        threshold: 0.3, // Trigger when 30% of element is visible
        rootMargin: '0px',
      }
    );

    observer.observe(sectionRef.current);

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} id="about" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="glass rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-fluid-lg font-display font-bold text-foreground mb-2">
                  {new Intl.NumberFormat().format(counters[index])}
                  <span className="text-gradient">{stat.suffix}</span>
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
