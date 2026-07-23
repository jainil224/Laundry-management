import React, { useState } from 'react';
import { motion } from 'motion/react';
import { HelpCircle, Send, CheckCircle2, Phone, Clock, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SupportProps {
  onNavigate: (route: string) => void;
}

export const Support: React.FC<SupportProps> = ({ onNavigate }) => {
  const { user } = useApp();

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('Missing Cloth Query');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const roomNum = user?.roomNumber || 'B-204';

  const FAQS = [
    {
      question: 'How do room laundry tags work?',
      answer:
        'Every cloth you register in your Wardrobe is linked to your Room Number. When you submit clothes for wash, a record is created. You can track this in the app.',
    },
    {
      question: 'What is the standard turnaround time for washing?',
      answer:
        'Standard wash turnaround is 24 to 48 hours. When your batch is processed by the laundry staff, its status changes to "READY" on your home dashboard.',
    },
    {
      question: 'What if an item is missing or mislaid?',
      answer:
        'Because all items are tagged with your photo and room number in your Wardrobe catalog, the warden can easily search and match unclaimed clothes. Use the query form below to submit a missing item report.',
    },
    {
      question: 'What are the laundry counter timings?',
      answer:
        'Drop-off & Collection Counter: 8:00 AM – 1:00 PM and 4:00 PM – 8:00 PM (Monday through Saturday). Sunday closed for heavy machinery maintenance.',
    },
  ];

  const handleSendQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSubmittedSuccess(true);
    setQuery('');
    setTimeout(() => setSubmittedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Banner */}
      <div className="bg-[#E39DF0] text-[#23241F] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-[#23241F] text-white px-2 py-0.5 rounded-md text-[10px] font-mono font-bold">
                RM #{roomNum}
              </span>
              <span className="text-xs font-mono font-bold tracking-wider uppercase opacity-80">
                WARDEN SUPPORT
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-xl mt-1">
              Hostel Laundry Support
            </h2>
            <p className="text-xs opacity-90 mt-0.5">
              Washing schedules, missing items & warden contacts
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-[#23241F] text-[#E39DF0] flex items-center justify-center font-mono font-bold text-lg shadow-sm">
            <HelpCircle className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* Laundry Counter Info */}
      <div className="bg-white rounded-2xl p-4 border border-[#23241F]/10 space-y-2">
        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#23241F]">
          <Clock className="w-4 h-4 text-[#2FBF9F]" />
          <span>COUNTER TIMINGS & LOCATION</span>
        </div>
        <p className="text-xs text-[#23241F]/80 leading-relaxed font-medium">
          Ground Floor Laundry Hub, {user?.hostelBlock || 'Block B'}. Open Mon–Sat: 8 AM–1 PM & 4 PM–8 PM.
        </p>
        <div className="pt-1 flex items-center space-x-3 text-[11px] font-mono text-[#23241F]/70">
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3 text-[#2FBF9F]" /> Warden: Ext #4022
          </span>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#23241F]/10 space-y-3">
        <h3 className="font-heading font-bold text-base text-[#23241F]">
          Frequently Asked Questions
        </h3>

        <div className="space-y-2">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="border border-[#23241F]/10 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-3.5 text-left font-heading font-semibold text-xs text-[#23241F] flex items-center justify-between bg-[#F7F5F1] hover:bg-neutral-100"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#23241F]/60" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#23241F]/60" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-3.5 bg-white text-xs text-[#23241F]/80 leading-relaxed border-t border-[#23241F]/5">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Query Form */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#23241F]/10 space-y-3">
        <h3 className="font-heading font-bold text-base text-[#23241F]">
          Contact Laundry Warden
        </h3>
        <p className="text-xs text-[#23241F]/60">
          Report missing clothes, fabric damage, or express laundry requests for Room #{roomNum}.
        </p>

        {submittedSuccess && (
          <div className="p-3 bg-[#2FBF9F]/20 text-[#23241F] text-xs font-semibold rounded-xl flex items-center space-x-1.5 border border-[#2FBF9F]">
            <CheckCircle2 className="w-4 h-4 text-[#2FBF9F]" />
            <span>Query submitted to laundry staff for Room #{roomNum}!</span>
          </div>
        )}

        <form onSubmit={handleSendQuery} className="space-y-3">
          <div>
            <label className="block text-xs font-mono font-bold text-[#23241F]/70 mb-1">
              Query Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F7F5F1] rounded-xl border border-[#23241F]/15 text-xs font-medium focus:outline-none focus:border-[#E39DF0]"
            >
              <option value="Missing Cloth Query">Missing Cloth Query</option>
              <option value="Special Wash Request">Special Wash Request</option>
              <option value="Damage Report">Damage Report</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[#23241F]/70 mb-1">
              Message Details
            </label>
            <textarea
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe your laundry query or item nickname..."
              className="w-full px-3.5 py-2.5 bg-[#F7F5F1] rounded-xl border border-[#23241F]/15 text-xs font-medium focus:outline-none focus:border-[#E39DF0]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#23241F] text-[#E39DF0] rounded-2xl font-heading font-bold text-xs hover:bg-black active:scale-98 transition-all flex items-center justify-center space-x-1.5 shadow-md"
          >
            <Send className="w-4 h-4" />
            <span>SUBMIT SUPPORT REQUEST</span>
          </button>
        </form>
      </div>
    </div>
  );
};
