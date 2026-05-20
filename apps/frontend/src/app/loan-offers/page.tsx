'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';

import { EligibilityConfidence } from '@/components/loan-offers/EligibilityConfidence';
import { LoanOfferCard } from '@/components/loan-offers/LoanOfferCard';
import { OfferComparison } from '@/components/loan-offers/OfferComparison';
import { RecommendationInsightsPanel } from '@/components/loan-offers/RecommendationInsightsPanel';
import { formatCurrency } from '@/lib/financial';
import { getSavedEmiEstimate } from '@/lib/onboarding-estimate';
import { generateLoanRecommendations, type RecommendationLead } from '@/lib/loan-recommendations';
import { eventsService } from '@/services/events.service';
import { leadsService } from '@/services/leads.service';

function getLeadSnapshot() {
  if (typeof window === 'undefined') {
    return '|Valued Customer';
  }

  return `${localStorage.getItem('leadId') ?? ''}|${localStorage.getItem('leadName') ?? 'Valued Customer'}`;
}

function subscribeToLeadChanges(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);

  return () => {
    window.removeEventListener('storage', onStoreChange);
  };
}

function getFirstName(name?: string | null) {
  return (name || 'there').split(' ')[0] || 'there';
}

export default function LoanOffersPage() {
  const router = useRouter();
  const leadSnapshot = useSyncExternalStore(subscribeToLeadChanges, getLeadSnapshot, () => '|Valued Customer');
  const [leadId, storedName] = leadSnapshot.split('|');
  const [lead, setLead] = useState<RecommendationLead | null>(null);
  const [isLoadingLead, setIsLoadingLead] = useState(true);
  const [comparedOfferIds, setComparedOfferIds] = useState<string[]>([]);
  const [savedOfferIds, setSavedOfferIds] = useState<string[]>([]);
  const [emiEstimate, setEmiEstimate] = useState(getSavedEmiEstimate);

  useEffect(() => {
    if (!leadId) {
      router.push('/start');
      return;
    }

    let isMounted = true;

    async function syncLoanOffers() {
      try {
        await eventsService.createEvent({
          leadId,
          eventType: 'LOAN_PAGE_VIEWED',
          metadata: { page: '/loan-offers', source: 'personalized_marketplace' },
        });

        const leadDetails = await leadsService.getLeadById(leadId) as RecommendationLead;

        if (isMounted) {
          setLead(leadDetails);
          setEmiEstimate(getSavedEmiEstimate());
        }
      } catch (error) {
        console.error('Failed to load loan recommendations', error);
      } finally {
        if (isMounted) {
          setIsLoadingLead(false);
        }
      }
    }

    syncLoanOffers();

    return () => {
      isMounted = false;
    };
  }, [leadId, router]);

  const recommendations = useMemo(
    () => generateLoanRecommendations(lead, emiEstimate),
    [lead, emiEstimate],
  );
  const comparedOffers = recommendations.offers.filter((offer) => comparedOfferIds.includes(offer.id));
  const topOffer = recommendations.offers[0];
  const displayName = lead?.name || storedName;

  function toggleCompare(offerId: string) {
    setComparedOfferIds((current) => {
      if (current.includes(offerId)) {
        return current.filter((id) => id !== offerId);
      }

      return [...current, offerId].slice(-3);
    });
  }

  function toggleSave(offerId: string) {
    setSavedOfferIds((current) => (
      current.includes(offerId)
        ? current.filter((id) => id !== offerId)
        : [...current, offerId]
    ));
  }

  function handleApply(offerId: string) {
    const offer = recommendations.offers.find((item) => item.id === offerId);

    if (typeof window !== 'undefined' && offer) {
      sessionStorage.setItem('leadnexus.selectedLoanOffer', JSON.stringify({
        offerId: offer.id,
        productName: offer.productName,
        eligibleAmount: offer.eligibleAmount,
        approvalProbability: offer.approvalProbability,
      }));
    }

    router.push('/apply');
  }

  function handleCallback(offerId: string) {
    const offer = recommendations.offers.find((item) => item.id === offerId);
    const params = new URLSearchParams({
      source: 'loan-offers',
      offerId,
    });

    if (offer) {
      params.set('loanAmount', String(offer.eligibleAmount));
      params.set('estimatedEmi', String(offer.estimatedEmi));
      params.set('tenure', String(offer.tenure));
      params.set('totalRepayment', String(offer.estimatedEmi * offer.tenure));
      params.set('interestPayable', String(Math.max(offer.estimatedEmi * offer.tenure - offer.eligibleAmount, 0)));
      params.set('calculatedAt', new Date().toISOString());
      params.set('sessionId', `offer-${offer.id}`);
    }

    router.push(`/callback-request?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-bold text-blue-800">
                Personalized lending marketplace
              </div>
              <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
                Recommended Loan Offers
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                {getFirstName(displayName)}, these recommendations are generated from your income profile,
                document readiness, EMI planning activity, lead score, and engagement behavior.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-bold text-blue-950">Eligibility confidence</span>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-blue-800 ring-1 ring-blue-100">
                  {recommendations.eligibility.score}%
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-blue-700" style={{ width: `${recommendations.eligibility.score}%` }} />
              </div>
              <p className="mt-3 text-sm font-semibold leading-6 text-blue-900">
                {recommendations.eligibility.label}. No impact on credit score.
              </p>
            </div>
          </div>
        </header>

        <EligibilityConfidence eligibility={recommendations.eligibility} />

        {isLoadingLead ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-600 shadow-sm">
            Syncing your profile and generating recommendations...
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Recommended products</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">Ranked by approval fit</h2>
                </div>
                {topOffer && (
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                    Top eligible amount: {formatCurrency(topOffer.eligibleAmount)}
                  </div>
                )}
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                {recommendations.offers.map((offer, index) => (
                  <LoanOfferCard
                    key={offer.id}
                    offer={offer}
                    isTopRecommendation={index === 0}
                    isCompared={comparedOfferIds.includes(offer.id)}
                    isSaved={savedOfferIds.includes(offer.id)}
                    onCompare={() => toggleCompare(offer.id)}
                    onSave={() => toggleSave(offer.id)}
                    onApply={() => handleApply(offer.id)}
                    onCallback={() => handleCallback(offer.id)}
                  />
                ))}
              </div>
            </div>

            <RecommendationInsightsPanel
              insights={recommendations.insights}
              nextBestActions={recommendations.nextBestActions}
            />
          </section>
        )}

        <OfferComparison offers={comparedOffers} />
      </div>
    </main>
  );
}
