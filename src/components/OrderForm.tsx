import { useRef, useState } from 'react';
import gsap from 'gsap';
import { Globe, Bot, Layout, Palette, Check, ArrowRight, MessageCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const services = [
  { 
    id: 'website', 
    label: 'Website Development', 
    icon: Globe,
    price: '$5,000 - $15,000',
    description: 'Professional website dengan design modern, responsive, dan SEO-friendly. Cocok untuk company profile, portfolio, atau landing page.'
  },
  { 
    id: 'chatbot', 
    label: 'AI Chatbot', 
    icon: Bot,
    price: '$3,000 - $10,000',
    description: 'AI chatbot pintar untuk customer service otomatis. Bisa integrasi dengan WhatsApp, website, atau platform lainnya.'
  },
  { 
    id: 'webapp', 
    label: 'Web Application', 
    icon: Layout,
    price: '$10,000 - $50,000',
    description: 'Custom web application untuk kebutuhan bisnis spesifik. Dashboard, CRM, inventory system, atau aplikasi internal perusahaan.'
  },
  { 
    id: 'design', 
    label: 'UI/UX Design', 
    icon: Palette,
    price: '$2,000 - $8,000',
    description: 'Design interface yang modern dan user-friendly. Termasuk wireframe, mockup, prototype, dan design system lengkap.'
  },
];

interface OrderFormProps {
  onSubmitSuccess?: () => void;
}

const OrderForm = ({ onSubmitSuccess }: OrderFormProps) => {
  const { toast } = useToast();
  const [currentSlide, setCurrentSlide] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    details: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const slideContentRef = useRef<HTMLDivElement>(null);
  const checkmarkRef = useRef<SVGSVGElement>(null);

  const animateSlideTransition = (toSlide: number) => {
    if (!slideContentRef.current) return;
    
    const direction = toSlide > currentSlide ? 1 : -1;
    
    gsap.to(slideContentRef.current, {
      x: -50 * direction,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        setCurrentSlide(toSlide);
        gsap.fromTo(
          slideContentRef.current,
          { x: 50 * direction, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
        );
      },
    });
  };

  const animateCheckmark = () => {
    if (!checkmarkRef.current) return;
    
    // Animate circle scale
    const circle = checkmarkRef.current.querySelector('circle');
    const path = checkmarkRef.current.querySelector('path');
    
    gsap.fromTo(circle, 
      { scale: 0, transformOrigin: 'center' },
      { scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
    );
    
    // Animate checkmark draw
    gsap.fromTo(path,
      { strokeDashoffset: 100 },
      { strokeDashoffset: 0, duration: 0.6, delay: 0.2, ease: 'power2.out' }
    );
  };

  const handleContinueFromSlide1 = () => {
    if (!selectedService) {
      toast({
        title: 'Pilih layanan',
        description: 'Silakan pilih layanan yang Anda butuhkan',
        variant: 'destructive',
      });
      return;
    }
    animateSlideTransition(2);
  };

  const handleContinueFromSlide2 = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: 'Lengkapi data',
        description: 'Nama dan email wajib diisi',
        variant: 'destructive',
      });
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Email tidak valid',
        description: 'Masukkan alamat email yang benar',
        variant: 'destructive',
      });
      return;
    }

    handleSubmit();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const selectedServiceData = services.find((s) => s.id === selectedService);

    try {
      const { error } = await supabase.functions.invoke('send-order-email', {
        body: {
          service: selectedServiceData?.label || '',
          price: selectedServiceData?.price || '',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          details: formData.details,
        },
      });

      if (error) throw error;

      // Transition to success slide
      animateSlideTransition(3);
      
      // Trigger checkmark animation after slide transition
      setTimeout(() => {
        animateCheckmark();
      }, 400);

    } catch (error: any) {
      console.error('Error submitting order:', error);
      toast({
        title: 'Gagal mengirim',
        description: 'Terjadi kesalahan. Silakan coba lagi atau hubungi via WhatsApp.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    // Reset form
    setCurrentSlide(1);
    setSelectedService(null);
    setFormData({ name: '', email: '', phone: '', details: '' });
    onSubmitSuccess?.();
  };

  const handleCardHover = (e: React.MouseEvent<HTMLDivElement>, isEntering: boolean) => {
    gsap.to(e.currentTarget, {
      y: isEntering ? -4 : 0,
      boxShadow: isEntering
        ? '0 8px 30px hsl(var(--crimson) / 0.15)'
        : '0 0 0px transparent',
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  return (
    <div
      className="order-form-container rounded-2xl p-6 md:p-10"
      style={{
        background: 'hsl(var(--surface))',
        border: '1px solid hsl(var(--crimson) / 0.1)',
      }}
    >
      {/* Progress Indicator */}
      {currentSlide !== 3 && (
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((step) => (
            <div
              key={step}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === currentSlide ? 'w-12 bg-crimson' : 'w-8 bg-muted'
              }`}
            />
          ))}
        </div>
      )}

      {/* Slide Content */}
      <div ref={slideContentRef} className="min-h-[400px]">
        
        {/* SLIDE 1: Select Service */}
        {currentSlide === 1 && (
          <div>
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
                Layanan Apa yang Anda Butuhkan?
              </h3>
              <p className="text-muted-foreground">
                Pilih salah satu layanan di bawah ini
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  onMouseEnter={(e) => handleCardHover(e, true)}
                  onMouseLeave={(e) => handleCardHover(e, false)}
                  className={`cursor-pointer p-6 rounded-xl transition-all duration-300 will-change-transform ${
                    selectedService === service.id
                      ? 'border-crimson bg-crimson/5 shadow-[inset_0_0_20px_hsl(var(--crimson)/0.08)]'
                      : 'border-border bg-background hover:border-crimson/30'
                  }`}
                  style={{ border: '1px solid' }}
                >
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                      selectedService === service.id ? 'bg-crimson/15' : 'bg-muted'
                    }`}
                  >
                    <service.icon
                      className={`w-7 h-7 ${
                        selectedService === service.id ? 'text-crimson' : 'text-muted-foreground'
                      }`}
                      strokeWidth={1.5}
                    />
                  </div>
                  <h4
                    className={`text-lg font-semibold mb-1 ${
                      selectedService === service.id ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {service.label}
                  </h4>
                  <p className="text-sm text-crimson font-medium">
                    {service.price}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 2: Price, Description & Contact Form */}
        {currentSlide === 2 && (
          <div>
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
                Detail Pesanan
              </h3>
              <p className="text-muted-foreground">
                Isi data Anda untuk melanjutkan
              </p>
            </div>

            {/* Selected Service Info */}
            {selectedService && (
              <div className="glass rounded-xl p-6 mb-6 max-w-2xl mx-auto">
                <div className="flex items-start gap-4">
                  {(() => {
                    const service = services.find((s) => s.id === selectedService);
                    const Icon = service?.icon;
                    return (
                      <>
                        <div className="w-12 h-12 rounded-lg bg-crimson/10 flex items-center justify-center flex-shrink-0">
                          {Icon && <Icon className="w-6 h-6 text-crimson" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">
                            {service?.label}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {service?.description}
                          </p>
                          <p className="text-crimson font-semibold">
                            Estimasi: {service?.price}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Contact Form */}
            <div className="space-y-4 max-w-2xl mx-auto">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Nama Lengkap <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-crimson focus:outline-none focus:ring-2 focus:ring-crimson/20 text-foreground transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Email <span className="text-crimson">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-crimson focus:outline-none focus:ring-2 focus:ring-crimson/20 text-foreground transition-all"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  No. WhatsApp (Opsional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-crimson focus:outline-none focus:ring-2 focus:ring-crimson/20 text-foreground transition-all"
                  placeholder="+62 812 3456 7890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Deskripsi Proyek (Opsional)
                </label>
                <textarea
                  value={formData.details}
                  onChange={(e) => setFormData((prev) => ({ ...prev, details: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-crimson focus:outline-none focus:ring-2 focus:ring-crimson/20 text-foreground transition-all resize-none"
                  placeholder="Ceritakan detail proyek Anda, fitur yang diinginkan, deadline, dll..."
                />
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3: Success State */}
        {currentSlide === 3 && (
          <div className="text-center py-8">
            <div className="mb-8 flex justify-center">
              <svg
                ref={checkmarkRef}
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="hsl(var(--crimson))"
                  strokeWidth="4"
                  fill="hsl(var(--crimson) / 0.1)"
                />
                <path
                  d="M35 60 L52 77 L85 44"
                  stroke="hsl(var(--crimson))"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  strokeDasharray="100"
                  strokeDashoffset="100"
                />
              </svg>
            </div>

            <h3 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Pesanan Berhasil Dibuat! 🎉
            </h3>
            
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Terima kasih! Tim kami akan segera menghubungi Anda dalam 1x24 jam untuk membahas proyek lebih lanjut.
            </p>

            <div className="glass rounded-xl p-6 mb-8 max-w-md mx-auto text-left">
              <p className="text-sm text-muted-foreground mb-3">
                <strong className="text-foreground">Apa yang terjadi selanjutnya?</strong>
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-crimson mt-0.5 flex-shrink-0" />
                  <span>Email konfirmasi telah dikirim</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-crimson mt-0.5 flex-shrink-0" />
                  <span>Tim kami akan review kebutuhan Anda</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-crimson mt-0.5 flex-shrink-0" />
                  <span>Anda akan dihubungi untuk konsultasi gratis</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleDone}
              className="btn-primary px-8 py-3 text-base"
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* Navigation Buttons (Slide 1 & 2 only) */}
      {currentSlide !== 3 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <button
            onClick={() => animateSlideTransition(currentSlide - 1)}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              currentSlide > 1
                ? 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            Kembali
          </button>

          {currentSlide === 1 ? (
            <button
              onClick={handleContinueFromSlide1}
              className={`btn-primary flex items-center gap-2 ${
                !selectedService ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Lanjutkan
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleContinueFromSlide2}
              disabled={!formData.name || !formData.email || isSubmitting}
              className={`btn-primary flex items-center gap-2 ${
                !formData.name || !formData.email || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Pesanan'}
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      )}

      {/* WhatsApp Alternative (Not on success slide) */}
      {currentSlide !== 3 && (
        <div className="text-center mt-6">
          <a
            href="https://wa.me/6285169954034"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-crimson transition-colors"
          >
            <MessageCircle size={16} />
            Atau chat langsung via WhatsApp
          </a>
        </div>
      )}
    </div>
  );
};

export default OrderForm;
