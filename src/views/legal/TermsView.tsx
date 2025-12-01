export default function TermsView() {
  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground mt-2 text-sm">Last updated: TBD</p>
        <hr className="mt-6" />
      </header>

      {/* Content */}
      <div className="space-y-10 text-[15px] leading-7 text-foreground/90">
        <section className="space-y-4">
          <p>
            These Terms of Service (“Terms”) outline the rules and conditions that
            govern your access to and use of our platform (“Service”). By accessing,
            browsing, or using the Service, you acknowledge that you have read,
            understood, and agree to be bound by these Terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Use of Service</h2>
          <p>
            You agree to use the Service only for lawful purposes and in compliance
            with all applicable laws, regulations, and these Terms. You may not use
            the Service in any manner that could harm, disable, overburden, or impair
            the platform or interfere with others’ use.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Accounts</h2>
          <p>
            To access certain features, you may be required to create an account.
            You are responsible for safeguarding your account credentials and for
            all activities that occur under your account. You agree to notify us
            immediately of any unauthorized use or security breach.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Modifications to the Service</h2>
          <p>
            We may modify, suspend, or discontinue any part of the Service at any
            time, with or without notice. We will not be liable for any changes or
            interruptions in service availability.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Changes to These Terms</h2>
          <p>
            We may update these Terms periodically to reflect changes in our
            practices, legal requirements, or improvements to the Service. Your
            continued use of the Service following the posting of updated Terms
            constitutes acceptance of those changes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Contact</h2>
          <p>
            If you have any questions regarding these Terms, please contact us at
            our support email.
          </p>
        </section>
      </div>
    </div>
  );
}
