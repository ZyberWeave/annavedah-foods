import Image from 'next/image'
import Link from 'next/link'
import { Heart, PawPrint, ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'Our Donation Commitment | Annavedah Foods',
  description: 'A part of every sale made through Annavedah Foods carries a purpose beyond business to support sheltered animals and pet care centers.',
}

export default function DonationCommitmentPage() {
  return (
    <div className="bg-[#faf6f0] min-h-screen pb-20 pt-28">
      {/* Hero Section */}
      <section className="relative overflow-hidden mb-16">
        <div className="absolute inset-0 bg-[#c9a45c]/10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6 pt-12 pb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#c9a45c]/20 text-[#8b1a1a] mb-6">
              <PawPrint className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2d1b15]">
              Our Donation Commitment
            </h1>
            <p className="text-xl md:text-2xl text-[#6b5347] max-w-2xl mx-auto leading-relaxed font-light">
              Because compassion should never be limited.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-[#e8ddd0]">
          
          <div className="p-8 md:p-12 space-y-12">
            
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-[#8b1a1a] flex items-center gap-4">
                <Heart className="w-8 h-8" />
                The Core Philosophy
              </h2>
              <div className="prose prose-lg text-[#6b5347] max-w-none">
                <p>
                  Humans, despite struggles, have the ability to work, earn, and search for ways to meet their needs. 
                  But animals live differently.
                </p>
                <p>
                  A pet, a rescued animal, or an abandoned life waiting in a shelter cannot ask for food, 
                  cannot earn, and cannot explain hunger. Their survival often depends entirely on compassion. 
                  And compassion should never be limited.
                </p>
                <p className="font-semibold text-[#2d1b15] text-xl mt-6 border-l-4 border-[#c9a45c] pl-6 py-2 bg-[#f0e8dc]/30 rounded-r-lg">
                  Whether it is a dog, cat, bird, rabbit, or any other animal receiving care in shelters and pet 
                  support centres, every life deserves food, safety, and attention.
                </p>
                <p>
                  This is why a part of every sale made through Annavedah Foods carries a purpose beyond business. 
                  It becomes a contribution toward care.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="space-y-6 bg-[#f0e8dc]/50 p-8 rounded-2xl h-full border border-[#e8ddd0]">
                <h3 className="text-2xl font-bold text-[#2d1b15]">Food With Responsibility</h3>
                <p className="text-[#6b5347]">
                  We believe that when food reaches one home, kindness can reach another life too. 
                  The same trust customers place in our products allows us to extend support where it is needed.
                </p>
                <div className="space-y-4">
                  <p className="font-semibold text-[#8b1a1a]">Each purchase helps us participate in something meaningful:</p>
                  <ul className="space-y-3">
                    {[
                      'Supporting food needs for sheltered animals',
                      'Contributing to pet care and welfare centres',
                      'Encouraging kindness beyond commerce',
                      'Turning everyday purchases into small acts of care'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-[#6b5347]">
                        <ShieldCheck className="w-5 h-5 text-[#c9a45c] mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-6 bg-[#faf6f0] p-8 rounded-2xl h-full border border-[#e8ddd0]">
                <h3 className="text-2xl font-bold text-[#2d1b15]">Our Founder's Belief</h3>
                <div className="prose prose-lg text-[#6b5347]">
                  <p className="italic">
                    "If we are able to serve food to people, we should also remember those who cannot ask for it themselves."
                  </p>
                  <p>
                    Animals love without conditions. They depend without words. And often, they wait for care that only human kindness can provide.
                  </p>
                  <p className="font-semibold mt-4 text-[#8b1a1a]">
                    For us, giving back to pet care centres is not a campaign. It is a responsibility we genuinely want to carry forward.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center max-w-2xl mx-auto pt-8 border-t border-[#e8ddd0]">
              <h2 className="text-3xl font-bold text-[#2d1b15] mb-6">Every Purchase Carries Care</h2>
              <p className="text-lg text-[#6b5347] mb-8">
                When you choose Annavedah Foods, you are choosing more than food for your family. 
                You are also becoming part of a small but meaningful effort to support animals across India. 
                Your trust helps us continue this commitment. 
                <br /><br />
                <strong className="text-[#8b1a1a]">And together, ordinary purchases can create extraordinary care.</strong>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products" className="bg-[#8b1a1a] hover:bg-[#6d1414] text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-[#8b1a1a]/20">
                  Shop Products
                </Link>
                <a href="/Our%20Donation%20Commitment%20Annavedah%20Foods.pdf" target="_blank" className="bg-white border-2 border-[#8b1a1a] text-[#8b1a1a] hover:bg-[#8b1a1a]/5 px-8 py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2">
                  Download PDF
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
