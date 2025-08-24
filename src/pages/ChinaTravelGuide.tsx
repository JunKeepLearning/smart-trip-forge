import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Wifi, Smartphone, KeyRound, CreditCard, MessageCircle, AppWindow } from 'lucide-react';

const GuideItem = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-1">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <div className="text-muted-foreground prose prose-sm max-w-none">
        {children}
      </div>
    </div>
  </div>
);

const ChinaTravelGuide = () => {
  return (
    <div className="bg-background">
      <header className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-base font-semibold text-primary tracking-wider uppercase">Travel Guide</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            First-Time Visitor's Guide to China
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Essential tips for a smooth and enjoyable journey. Prepare these things beforehand to make your trip seamless.
          </p>
        </div>
      </header>

      <main className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto grid grid-cols-1 gap-10">
            
            <GuideItem icon={<KeyRound size={20} />} title="VPN (Virtual Private Network)">
              <p>A VPN is crucial for accessing many international websites and apps like Google, Facebook, Instagram, WhatsApp, and Twitter, which are blocked in China. </p>
              <ul>
                <li><strong>Why you need it:</strong> To stay connected with services from back home.</li>
                <li><strong>What to do:</strong> Purchase, download, and install a reliable VPN service on your phone and laptop **before** you leave for China. It's nearly impossible to do so once you've arrived.</li>
                <li><strong>Popular Options:</strong> Look for services known to work well in China (e.g., ExpressVPN, NordVPN, Astrill VPN). Check recent reviews as the situation can change.</li>
              </ul>
            </GuideItem>

            <GuideItem icon={<Smartphone size={20} />} title="SIM Card & Data">
              <p>Having mobile data is essential for navigation, translation, and payments. You have a few options:</p>
              <ul>
                <li><strong>International Roaming:</strong> Convenient but can be very expensive. Check rates with your home provider.</li>
                <li><strong>Local SIM Card:</strong> You can buy one at the airport (e.g., from China Unicom, China Mobile). You will need your passport for registration. This is often the most reliable option.</li>
                <li><strong>eSIM:</strong> If your phone supports it, you can buy a travel eSIM for China online before you go (e.g., from Airalo, Holafly). This is very convenient as you can set it up in advance.</li>
              </ul>
            </GuideItem>

            <GuideItem icon={<CreditCard size={20} />} title="Payments & Money">
              <p>China is moving towards a cashless society, and mobile payments are dominant. Foreign credit cards are not widely accepted outside of major hotels and high-end restaurants.</p>
              <ul>
                <li><strong>Mobile Payments:</strong> Your top priority. Download **Alipay** or **WeChat**. Both now have features allowing you to link your international credit cards (Visa, Mastercard, etc.). Set this up and verify it before your trip.</li>
                <li><strong>Cash:</strong> It's wise to carry some cash (Chinese Yuan, CNY) for smaller vendors, taxis, or as a backup. You can withdraw from ATMs at the airport or banks.</li>
                <li><strong>Credit Cards:</strong> Useful for booking flights/hotels online and at large international chains, but don't rely on it for daily expenses.</li>
              </ul>
            </GuideItem>

            <GuideItem icon={<AppWindow size={20} />} title="Essential Apps">
              <p>Download these apps to make your life much easier.</p>
              <ul>
                <li><strong>WeChat (微信):</strong> More than a messaging app, it's a do-everything tool for payments, mini-programs for transport, and communication.</li>
                <li><strong>Alipay (支付宝):</strong> The other major payment app.</li>
                <li><strong>A good Map App:</strong> Google Maps has limited functionality. **Apple Maps** (if you use an iPhone) works reasonably well for navigation. **Amap (高德地图)** is a popular local choice but is in Chinese.</li>
                <li><strong>Translation App:</strong> Google Translate (via VPN) or Microsoft Translator are very helpful.</li>
                <li><strong>Didi (滴滴出行):</strong> The equivalent of Uber/Grab for ride-hailing. You can usually link an international card.</li>
              </ul>
            </GuideItem>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ChinaTravelGuide;
